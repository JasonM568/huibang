import { NextRequest, NextResponse } from "next/server";
import { verifyCheckMacValue } from "@/lib/ecpay";
import { db } from "@/lib/db";
import { diagnosticTokens } from "@/lib/db/schema";
import { sendDiagnosticToken } from "@/lib/email";

/**
 * ECPay 付款結果通知（Server-side callback）
 * 綠界會 POST application/x-www-form-urlencoded 到這個 URL
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // 將 FormData 轉換為 Record
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    console.log("[ECPay Callback] Received:", {
      MerchantTradeNo: params.MerchantTradeNo,
      RtnCode: params.RtnCode,
      RtnMsg: params.RtnMsg,
      TradeAmt: params.TradeAmt,
      CustomField1: params.CustomField1,
      CustomField2: params.CustomField2,
    });

    // 1. 驗證 CheckMacValue
    if (!verifyCheckMacValue(params)) {
      console.error("[ECPay Callback] CheckMacValue 驗證失敗");
      return new NextResponse("0|ErrorMessage", { status: 200 });
    }

    // 2. 檢查付款是否成功（RtnCode = 1 代表成功）
    if (params.RtnCode !== "1") {
      console.log(`[ECPay Callback] 付款未成功: RtnCode=${params.RtnCode}, RtnMsg=${params.RtnMsg}`);
      return new NextResponse("1|OK", { status: 200 });
    }

    // 3. 取得客戶資訊
    const email = params.CustomField1;
    const contactName = params.CustomField2 || "";
    const tradeNo = params.MerchantTradeNo || "";

    if (!email) {
      console.error("[ECPay Callback] 缺少 CustomField1 (email)");
      return new NextResponse("1|OK", { status: 200 });
    }

    // 4. 自動產生 diagnostic token（30天效期）
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

    console.log(`[ECPay Callback] Token 已建立: ${newToken.token} → ${email}`);

    // 5. 寄送健診連結給客戶
    try {
      await sendDiagnosticToken({
        email,
        contactName,
        tokenUrl,
        tradeNo,
      });
      console.log(`[ECPay Callback] 健診連結已寄送至 ${email}`);
    } catch (emailError) {
      console.error("[ECPay Callback] 寄信失敗:", emailError);
      // 寄信失敗不影響回傳，token 已建立，可從後台手動補寄
    }

    // 6. 回傳 "1|OK" 告知綠界處理成功
    return new NextResponse("1|OK", { status: 200 });
  } catch (error) {
    console.error("[ECPay Callback] 處理錯誤:", error);
    // 即使出錯也回傳 1|OK，避免綠界重複發送
    return new NextResponse("1|OK", { status: 200 });
  }
}
