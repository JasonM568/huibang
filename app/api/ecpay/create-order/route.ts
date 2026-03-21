import { NextRequest, NextResponse } from "next/server";
import { createOrderParams } from "@/lib/ecpay";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";

// AI 個體包方案定義
const AI_PACK_PLANS: Record<string, { name: string; price: number }> = {
  "2": { name: "AI 個體包 — 小當家組（5 位 AI Agent）", price: 1299 },
  "3": { name: "AI 個體包 — 總舖師組（10 位 AI Agent）", price: 2999 },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, contactName, phone, product, planId, carrierNum, discountCode, invoiceType, taxId, companyName } = body;

    // 折扣碼驗證
    const VALID_DISCOUNT_CODE = process.env.DISCOUNT_CODE || "TRIAL300";
    const DISCOUNT_AMOUNT = 300;

    if (!email) {
      return NextResponse.json({ error: "Email 為必填" }, { status: 400 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://huibang.com.tw";

    // 依據產品類型設定參數
    let orderOptions: Parameters<typeof createOrderParams>[0] = {
      email,
      contactName: contactName || "",
      baseUrl,
    };

    // 決定金額與品名
    let amount = 999;
    let itemName = "AI 社群帳號深度健診報告 x1";
    const productType = product || "diagnostic";

    if (product === "ai-pack" && planId && AI_PACK_PLANS[planId]) {
      const plan = AI_PACK_PLANS[planId];
      amount = plan.price;

      // 套用折扣碼
      if (discountCode && discountCode.toUpperCase() === VALID_DISCOUNT_CODE.toUpperCase()) {
        amount = Math.max(amount - DISCOUNT_AMOUNT, 1);
        itemName = `${plan.name}（${discountCode.toUpperCase()} -$${DISCOUNT_AMOUNT}）x1`;
        console.log(`[ECPay] Discount applied: ${discountCode}, amount: ${amount}`);
      } else {
        itemName = `${plan.name} x1`;
        if (discountCode) console.log(`[ECPay] Invalid discount code: ${discountCode}`);
      }

      orderOptions = {
        ...orderOptions,
        amount,
        itemName,
        tradeDesc: "AI個體包餐飲業客製化GPTs",
        productType: "ai-pack",
        planId,
      };
    }

    const { params, apiUrl } = createOrderParams(orderOptions);

    const tradeNo = params.MerchantTradeNo;

    // 如果是 AI 個體包，覆寫 OrderResultURL
    if (product === "ai-pack" && planId) {
      params.OrderResultURL = `${baseUrl}/checkout/ai-pack/success?trade_no=${tradeNo}&plan=${planId}&amount=${amount}`;
      // 重新計算 CheckMacValue
      delete params.CheckMacValue;
      const { generateCheckMacValue } = await import("@/lib/ecpay");
      params.CheckMacValue = generateCheckMacValue(params);
    }

    // 寫入訂單記錄（付款前先建立，status: pending）
    try {
      await db.insert(orders).values({
        orderNo: tradeNo,
        productType,
        planId: planId || null,
        amount,
        itemName,
        customerEmail: email,
        customerName: contactName || null,
        customerPhone: phone || null,
        carrierType: invoiceType === "company" ? "company" : (carrierNum ? "barcode" : null),
        carrierNum: invoiceType === "company" ? taxId : (carrierNum || null),
        note: invoiceType === "company" ? `三聯式｜統編: ${taxId}｜抬頭: ${companyName}` : null,
        paymentStatus: "pending",
        invoiceStatus: "none",
      });
      console.log(`[ECPay] Order created: ${tradeNo}, product=${productType}`);
    } catch (dbError) {
      console.error("[ECPay] Failed to create order record:", dbError);
      // DB 寫入失敗不阻擋付款流程
    }

    // 回傳自動提交表單的 HTML
    const inputFields = Object.entries(params)
      .map(
        ([key, value]) =>
          `<input type="hidden" name="${key}" value="${escapeHtml(value)}" />`
      )
      .join("\n");

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>正在前往綠界付款...</title>
</head>
<body>
  <form id="ecpay-form" method="POST" action="${apiUrl}">
    ${inputFields}
  </form>
  <p style="text-align:center;margin-top:50px;font-family:sans-serif;color:#666;">
    正在前往付款頁面，請稍候...
  </p>
  <script>document.getElementById('ecpay-form').submit();</script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("ECPay create-order error:", error);
    return NextResponse.json(
      { error: "建立訂單失敗" },
      { status: 500 }
    );
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
