import { NextRequest, NextResponse } from "next/server";
import { verifyCheckMacValue } from "@/lib/ecpay";
import { db } from "@/lib/db";
import { diagnosticTokens, orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendDiagnosticToken, sendAiPackEmail, sendPaymentFailedEmail, sendInvoiceEmail, notifyTeamInvoiceFailed } from "@/lib/email";
import { issueInvoice } from "@/lib/ezpay";

/**
 * ECPay 付款結果通知（Server-side callback）
 * 綠界會 POST application/x-www-form-urlencoded 到這個 URL
 * 支援：健診訂單 + AI 個體包訂單
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // 將 FormData 轉換為 Record
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    const productType = params.CustomField3 || "";
    const planId = params.CustomField4 || "";
    const tradeNo = params.MerchantTradeNo || "";

    console.log("[ECPay Callback] Received:", {
      MerchantTradeNo: tradeNo,
      RtnCode: params.RtnCode,
      RtnMsg: params.RtnMsg,
      TradeAmt: params.TradeAmt,
      CustomField1: params.CustomField1,
      CustomField2: params.CustomField2,
      productType,
      planId,
    });

    // 1. 驗證 CheckMacValue
    if (!verifyCheckMacValue(params)) {
      console.error("[ECPay Callback] CheckMacValue 驗證失敗");
      return new NextResponse("0|ErrorMessage", { status: 200 });
    }

    // 2. 查找預建立的訂單記錄
    let order: typeof orders.$inferSelect | null = null;
    try {
      const [found] = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNo, tradeNo))
        .limit(1);
      order = found || null;
    } catch (dbErr) {
      console.error("[ECPay Callback] DB lookup error:", dbErr);
    }

    // 3. 付款失敗
    if (params.RtnCode !== "1") {
      console.log(`[ECPay Callback] 付款未成功: RtnCode=${params.RtnCode}, RtnMsg=${params.RtnMsg}`);
      if (order) {
        try {
          await db.update(orders)
            .set({ paymentStatus: "failed", updatedAt: new Date() })
            .where(eq(orders.id, order.id));
        } catch (e) {
          console.error("[ECPay Callback] Failed to update order status:", e);
        }

        // 通知客戶付款失敗
        try {
          await sendPaymentFailedEmail({
            email: order.customerEmail,
            contactName: order.customerName || "",
            orderNo: order.orderNo,
            productName: order.itemName || "惠邦行銷服務",
          });
          console.log(`[ECPay Callback] 付款失敗通知已寄送至 ${order.customerEmail}`);
        } catch (emailErr) {
          console.error("[ECPay Callback] 付款失敗通知寄信失敗:", emailErr);
        }
      }
      return new NextResponse("1|OK", { status: 200 });
    }

    // 4. 付款成功 — 更新訂單狀態
    if (order) {
      try {
        await db.update(orders)
          .set({
            paymentStatus: "paid",
            ecpayTradeNo: params.TradeNo || null,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, order.id));
        console.log(`[ECPay Callback] Order ${tradeNo} marked as paid`);
      } catch (e) {
        console.error("[ECPay Callback] Failed to update payment status:", e);
      }
    }

    // 5. 開立電子發票（非阻塞 — 失敗不影響付款成功流程）
    if (order) {
      try {
        await db.update(orders)
          .set({ invoiceStatus: "pending", updatedAt: new Date() })
          .where(eq(orders.id, order.id));

        const invoiceResult = await issueInvoice({
          orderNo: order.orderNo,
          amount: order.amount,
          itemName: order.itemName || "惠邦行銷服務",
          itemCount: 1,
          itemUnit: "組",
          buyerName: order.customerName || "消費者",
          buyerEmail: order.customerEmail,
          buyerUbn: order.buyerUbn || null,
          carrierType: order.carrierType,
          carrierNum: order.carrierNum,
        });

        if (invoiceResult.success) {
          await db.update(orders)
            .set({
              invoiceStatus: "issued",
              invoiceNo: invoiceResult.invoiceNo || null,
              invoiceError: null,
              updatedAt: new Date(),
            })
            .where(eq(orders.id, order.id));
          console.log(`[ECPay Callback] Invoice issued: ${invoiceResult.invoiceNo}`);

          // 寄送發票通知給客戶
          try {
            await sendInvoiceEmail({
              email: order.customerEmail,
              contactName: order.customerName || "",
              orderNo: order.orderNo,
              invoiceNo: invoiceResult.invoiceNo || "",
              amount: order.amount,
              itemName: order.itemName || "惠邦行銷服務",
            });
            console.log(`[ECPay Callback] 發票通知已寄送至 ${order.customerEmail}`);
          } catch (emailErr) {
            console.error("[ECPay Callback] 發票通知寄信失敗:", emailErr);
          }
        } else {
          await db.update(orders)
            .set({
              invoiceStatus: "failed",
              invoiceError: invoiceResult.error || "Unknown error",
              updatedAt: new Date(),
            })
            .where(eq(orders.id, order.id));
          console.error(`[ECPay Callback] Invoice failed: ${invoiceResult.error}`);

          // 通知團隊發票開立失敗
          try {
            await notifyTeamInvoiceFailed({
              orderNo: order.orderNo,
              customerEmail: order.customerEmail,
              amount: order.amount,
              errorMessage: invoiceResult.error || "Unknown error",
            });
            console.log(`[ECPay Callback] 發票失敗通知已寄送給團隊`);
          } catch (emailErr) {
            console.error("[ECPay Callback] 發票失敗通知寄信失敗:", emailErr);
          }
        }
      } catch (invoiceError) {
        try {
          await db.update(orders)
            .set({
              invoiceStatus: "failed",
              invoiceError: invoiceError instanceof Error ? invoiceError.message : "Unknown",
              updatedAt: new Date(),
            })
            .where(eq(orders.id, order.id));
        } catch (e) {
          console.error("[ECPay Callback] Failed to update invoice error:", e);
        }
        console.error("[ECPay Callback] Invoice error:", invoiceError);
      }
    }

    // 6. 取得客戶資訊（優先用 order，fallback 到 CustomField）
    const email = order?.customerEmail || params.CustomField1;
    const contactName = order?.customerName || params.CustomField2 || "";

    if (!email) {
      console.error("[ECPay Callback] 缺少 email");
      return new NextResponse("1|OK", { status: 200 });
    }

    // 7. 依產品類型分流處理（發送 email）
    const effectiveProductType = order?.productType || productType;
    const effectivePlanId = order?.planId || planId;

    if (effectiveProductType === "ai-pack") {
      await handleAiPackCallback({ email, contactName, tradeNo, planId: effectivePlanId || "" });
    } else {
      await handleDiagnosticCallback({ email, contactName, tradeNo });
    }

    // 8. 回傳 "1|OK" 告知綠界處理成功
    return new NextResponse("1|OK", { status: 200 });
  } catch (error) {
    console.error("[ECPay Callback] 處理錯誤:", error);
    // 即使出錯也回傳 1|OK，避免綠界重複發送
    return new NextResponse("1|OK", { status: 200 });
  }
}

// --- 健診訂單處理 ---
async function handleDiagnosticCallback(opts: {
  email: string;
  contactName: string;
  tradeNo: string;
}) {
  const { email, contactName, tradeNo } = opts;

  // 自動產生 diagnostic token（30天效期）
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const [newToken] = await db
    .insert(diagnosticTokens)
    .values({
      email,
      contactName: contactName || null,
      note: `ECPay 自動：${tradeNo}`,
      expiresAt,
      status: "unused",
    })
    .returning();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://huibang.com.tw";
  const tokenUrl = `${baseUrl}/diagnostic?token=${newToken.token}`;

  console.log(`[ECPay Callback] Diagnostic token 已建立: ${newToken.token} → ${email}`);

  try {
    await sendDiagnosticToken({ email, contactName, tokenUrl, tradeNo });
    console.log(`[ECPay Callback] 健診連結已寄送至 ${email}`);
  } catch (emailError) {
    console.error("[ECPay Callback] 健診寄信失敗:", emailError);
  }
}

// --- AI 個體包處理 ---
async function handleAiPackCallback(opts: {
  email: string;
  contactName: string;
  tradeNo: string;
  planId: string;
}) {
  const { email, contactName, tradeNo, planId } = opts;

  console.log(`[ECPay Callback] AI 個體包付款成功: plan=${planId}, email=${email}`);

  try {
    await sendAiPackEmail({ email, contactName, tradeNo, planId });
    console.log(`[ECPay Callback] AI 個體包連結已寄送至 ${email}`);
  } catch (emailError) {
    console.error("[ECPay Callback] AI 個體包寄信失敗:", emailError);
  }
}
