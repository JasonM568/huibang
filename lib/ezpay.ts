import crypto from "crypto";

// ezPay 藍新電子發票 — 測試/正式環境切換
const isTestMode = process.env.EZPAY_ENV === "test";

const EZPAY_MERCHANT_ID = process.env.EZPAY_MERCHANT_ID || "";
const EZPAY_HASH_KEY = process.env.EZPAY_HASH_KEY || "";
const EZPAY_HASH_IV = process.env.EZPAY_HASH_IV || "";

const EZPAY_API_URL = isTestMode
  ? "https://cinv.ezpay.com.tw/Api/invoice_issue"
  : "https://inv.ezpay.com.tw/Api/invoice_issue";

/**
 * AES-256-CBC 加密
 * ezPay 要求 PostData 使用 AES 加密後以 hex 傳送
 */
function aesEncrypt(data: string): string {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    EZPAY_HASH_KEY,
    EZPAY_HASH_IV
  );
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

/**
 * AES-256-CBC 解密（用於解析 ezPay 回傳結果）
 */
function aesDecrypt(encrypted: string): string {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    EZPAY_HASH_KEY,
    EZPAY_HASH_IV
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

interface IssueInvoiceParams {
  orderNo: string;
  amount: number;
  itemName: string;
  itemCount?: number;
  itemUnit?: string;
  buyerEmail: string;
  carrierType?: string | null;
  carrierNum?: string | null;
}

interface IssueInvoiceResult {
  success: boolean;
  invoiceNo?: string;
  error?: string;
  rawResponse?: unknown;
}

/**
 * 開立電子發票（B2C）
 * 付款成功後在 callback 中呼叫
 */
export async function issueInvoice(
  params: IssueInvoiceParams
): Promise<IssueInvoiceResult> {
  // 檢查必要環境變數
  if (!EZPAY_MERCHANT_ID || !EZPAY_HASH_KEY || !EZPAY_HASH_IV) {
    console.warn("[ezPay] Missing credentials, skipping invoice");
    return {
      success: false,
      error: "ezPay credentials not configured",
    };
  }

  try {
    const now = new Date();
    const createDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const timeStamp = String(Math.floor(now.getTime() / 1000));

    const itemCount = params.itemCount || 1;
    const itemUnit = params.itemUnit || "\u7D44"; // 組

    // 未稅金額 & 稅額（應稅 5%）
    const amt = Math.round(params.amount / 1.05);
    const taxAmt = params.amount - amt;

    // 組裝 PostData
    const postData: Record<string, string> = {
      RespondType: "JSON",
      Version: "1.5",
      TimeStamp: timeStamp,
      TransNum: "",
      MerchantOrderNo: params.orderNo,
      Status: "1", // 立即開立
      Category: "B2C",
      BuyerName: "",
      BuyerEmail: params.buyerEmail,
      PrintFlag: "Y",
      TaxType: "1", // 應稅
      TaxRate: "5",
      Amt: String(amt),
      TaxAmt: String(taxAmt),
      TotalAmt: String(params.amount),
      ItemName: params.itemName,
      ItemCount: String(itemCount),
      ItemUnit: itemUnit,
      ItemPrice: String(params.amount),
      ItemAmt: String(params.amount),
      CreateDate: createDate,
    };

    // 手機條碼載具
    if (params.carrierType === "barcode" && params.carrierNum) {
      postData.CarrierType = "0"; // 0 = 手機條碼
      postData.CarrierNum = params.carrierNum;
      postData.PrintFlag = "N"; // 有載具不印紙本
    }

    // URL-encode 後組裝
    const postDataStr = Object.entries(postData)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");

    // AES 加密
    const encryptedPostData = aesEncrypt(postDataStr);

    // 送出請求
    const formBody = new URLSearchParams({
      MerchantID_: EZPAY_MERCHANT_ID,
      PostData_: encryptedPostData,
    });

    console.log(`[ezPay] Issuing invoice for order ${params.orderNo}, amount=${params.amount}`);

    const response = await fetch(EZPAY_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody.toString(),
    });

    const responseText = await response.text();
    let result: { Status?: string; Message?: string; Result?: string };

    try {
      result = JSON.parse(responseText);
    } catch {
      console.error("[ezPay] Invalid response:", responseText.slice(0, 200));
      return { success: false, error: "Invalid response from ezPay" };
    }

    if (result.Status === "SUCCESS") {
      // 解密回傳結果取得發票號碼
      let invoiceNo = "";
      if (result.Result) {
        try {
          const decryptedResult = JSON.parse(aesDecrypt(result.Result));
          invoiceNo = decryptedResult.InvoiceNumber || "";
        } catch {
          console.warn("[ezPay] Could not decrypt result, but status is SUCCESS");
        }
      }

      console.log(`[ezPay] Invoice issued successfully: ${invoiceNo}`);
      return {
        success: true,
        invoiceNo,
        rawResponse: result,
      };
    } else {
      const errorMsg = `${result.Status}: ${result.Message}`;
      console.error(`[ezPay] Invoice failed: ${errorMsg}`);
      return {
        success: false,
        error: errorMsg,
        rawResponse: result,
      };
    }
  } catch (error) {
    console.error("[ezPay] Invoice issue error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
