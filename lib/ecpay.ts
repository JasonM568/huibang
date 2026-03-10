import crypto from "crypto";

// 綠界測試/正式環境切換
// ECPAY_ENV=test → 使用綠界官方測試帳號（免真實扣款）
// ECPAY_ENV=production 或未設定 → 使用正式帳號
const isTestMode = process.env.ECPAY_ENV === "test";

// 測試環境使用綠界官方提供的測試商店
const ECPAY_MERCHANT_ID = isTestMode
  ? "3002607"
  : (process.env.ECPAY_MERCHANT_ID || "");
const ECPAY_HASH_KEY = isTestMode
  ? "pwFHCqoQZGmho4w6"
  : (process.env.ECPAY_HASH_KEY || "");
const ECPAY_HASH_IV = isTestMode
  ? "EkRm7iFT261dpevs"
  : (process.env.ECPAY_HASH_IV || "");

const ECPAY_API_URL = isTestMode
  ? "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5"
  : "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5";

/**
 * ECPay URL encode 規則（與 .NET 的 Server.UrlEncode 相容）
 * 小寫 hex，特殊字元替換
 */
function ecpayUrlEncode(str: string): string {
  let encoded = encodeURIComponent(str);
  // ECPay 特殊規則：某些字元需要特定格式
  encoded = encoded
    .replace(/%20/g, "+")
    .replace(/%2d/gi, "-")
    .replace(/%5f/gi, "_")
    .replace(/%2e/gi, ".")
    .replace(/%21/g, "!")
    .replace(/%2a/gi, "*")
    .replace(/%28/g, "(")
    .replace(/%29/g, ")")
    .replace(/%7e/gi, "~");
  // 轉小寫 hex
  encoded = encoded.replace(/%([0-9A-F]{2})/gi, (_, hex) => `%${hex.toLowerCase()}`);
  return encoded;
}

/**
 * 產生 CheckMacValue（SHA256）
 */
export function generateCheckMacValue(
  params: Record<string, string>
): string {
  // 1. 按 key 字母排序（不分大小寫）
  const sortedKeys = Object.keys(params).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  // 2. 串接為 key=value&key=value
  const paramStr = sortedKeys.map((key) => `${key}=${params[key]}`).join("&");

  // 3. 前後加上 HashKey 和 HashIV
  const raw = `HashKey=${ECPAY_HASH_KEY}&${paramStr}&HashIV=${ECPAY_HASH_IV}`;

  // 4. URL encode（小寫）
  const encoded = ecpayUrlEncode(raw).toLowerCase();

  // 5. SHA256 → 轉大寫
  const hash = crypto.createHash("sha256").update(encoded).digest("hex").toUpperCase();

  return hash;
}

/**
 * 驗證綠界回調的 CheckMacValue
 */
export function verifyCheckMacValue(
  params: Record<string, string>
): boolean {
  const receivedMac = params.CheckMacValue;
  if (!receivedMac) return false;

  // 移除 CheckMacValue 再計算
  const paramsWithoutMac = { ...params };
  delete paramsWithoutMac.CheckMacValue;

  const calculatedMac = generateCheckMacValue(paramsWithoutMac);
  return calculatedMac === receivedMac;
}

/**
 * 產生唯一訂單編號
 * 格式：HB + 年月日時分秒 + 4位亂數（共20字以內）
 */
export function generateTradeNo(): string {
  const now = new Date();
  const dateStr = [
    now.getFullYear().toString().slice(-2),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("");
  const rand = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `HB${dateStr}${rand}`;
}

/**
 * 產生綠界 AIO 訂單參數
 * 支援不同產品類型（健診、AI 個體包等）
 */
export function createOrderParams(options: {
  email: string;
  contactName: string;
  baseUrl: string;
  amount?: number;
  itemName?: string;
  tradeDesc?: string;
  successUrl?: string;
  productType?: string;
  planId?: string;
}): { params: Record<string, string>; apiUrl: string } {
  const now = new Date();
  const tradeDate = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

  const tradeNo = generateTradeNo();

  const amount = options.amount || 999;
  const itemName = options.itemName || "AI 社群帳號深度健診報告 x1";
  const tradeDesc = options.tradeDesc || "AI社群帳號深度健診";
  const successUrl = options.successUrl || `${options.baseUrl}/checkout/diagnostic/success?trade_no=${tradeNo}`;

  const params: Record<string, string> = {
    MerchantID: ECPAY_MERCHANT_ID,
    MerchantTradeNo: tradeNo,
    MerchantTradeDate: tradeDate,
    PaymentType: "aio",
    TotalAmount: String(amount),
    TradeDesc: tradeDesc,
    ItemName: itemName,
    ReturnURL: `${options.baseUrl}/api/ecpay/callback`,
    OrderResultURL: successUrl,
    ChoosePayment: "ALL",
    EncryptType: "1",
    CustomField1: options.email,
    CustomField2: options.contactName,
    CustomField3: options.productType || "",
    CustomField4: options.planId || "",
    NeedExtraPaidInfo: "N",
  };

  // 計算 CheckMacValue
  params.CheckMacValue = generateCheckMacValue(params);

  return { params, apiUrl: ECPAY_API_URL };
}
