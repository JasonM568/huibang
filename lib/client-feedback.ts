import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { Resend } from "resend";

// 客戶系統回饋（2026-08-04）：非公開頁 /client-feedback（多客戶共用）。
// 通行碼閘門（FEEDBACK_ACCESS_CODE）＋檔案直傳 Supabase Storage（signed upload URL，
// 大影片不經 Vercel function）＋Email/Discord 通知。

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-change-me");

export const FEEDBACK_COOKIE = "cf-access";
export const FEEDBACK_BUCKET = "client-feedback";

/** 影片上限：2 分鐘（前端驗時長）；大小 50MB（Supabase 免費層全域上限；升級方案後可調高） */
export const VIDEO_MAX_SIZE = 50 * 1024 * 1024;
export const IMAGE_MAX_SIZE = 10 * 1024 * 1024;

export const ALLOWED_UPLOAD_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
  // 提供資料用文件檔（2026-08-04）
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-excel": "xls",
  "text/csv": "csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

export function isVideoType(contentType: string): boolean {
  return contentType.startsWith("video/");
}

// ── 通行碼閘門（每客戶一組碼；輸入通行碼即識別公司）──

/** 通行碼→客戶對應：env FEEDBACK_ACCESS_CODES="碼1:公司1,碼2:公司2"；
 *  相容舊設定 FEEDBACK_ACCESS_CODE（單一碼＝環安傢俱）。 */
export function accessCodeMap(): Map<string, string> {
  const map = new Map<string, string>();
  const legacy = process.env.FEEDBACK_ACCESS_CODE;
  if (legacy) map.set(legacy.trim(), "環安傢俱");
  for (const pair of (process.env.FEEDBACK_ACCESS_CODES ?? "").split(",")) {
    const [code, company] = pair.split(":").map((x) => x?.trim());
    if (code && company) map.set(code, company);
  }
  return map;
}

export async function issueFeedbackCookie(company: string): Promise<string> {
  return new SignJWT({ scope: "client-feedback", company })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .setIssuedAt()
    .sign(secret);
}

/** 驗 cookie；有效回公司名，無效回 null。 */
export async function feedbackAccessCompany(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(FEEDBACK_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.scope !== "client-feedback") return null;
    return typeof payload.company === "string" && payload.company ? payload.company : "環安傢俱";
  } catch {
    return null;
  }
}

// ── Supabase Storage（raw REST，不引入 supabase-js 依賴）──

function supabaseEnv() {
  const url = process.env.POSTGRES_SUPABASE_URL ?? process.env.NEXT_PUBLIC_POSTGRES_SUPABASE_URL;
  const key = process.env.POSTGRES_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase 環境變數未設定");
  return { url: url.replace(/\/$/, ""), key };
}

/** 冪等建立 private bucket（已存在忽略）。 */
export async function ensureFeedbackBucket(): Promise<void> {
  const { url, key } = supabaseEnv();
  const res = await fetch(`${url}/storage/v1/bucket`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ id: FEEDBACK_BUCKET, name: FEEDBACK_BUCKET, public: false, file_size_limit: VIDEO_MAX_SIZE }),
  });
  if (!res.ok && res.status !== 409) {
    const body = await res.text();
    if (!/already exists/i.test(body)) throw new Error(`建立儲存空間失敗：${body.slice(0, 200)}`);
  }
}

/** 產生單檔直傳 signed upload URL（客戶端 PUT 上傳，不經 Vercel function）。 */
export async function createUploadUrl(path: string): Promise<string> {
  const { url, key } = supabaseEnv();
  const res = await fetch(`${url}/storage/v1/object/upload/sign/${FEEDBACK_BUCKET}/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`產生上傳連結失敗：${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { url: string };
  return `${url}/storage/v1${data.url}`;
}

/** 簽名下載連結（admin 檢視；預設 1 小時）。 */
export async function feedbackSignedUrl(path: string, expiresInSec = 3600): Promise<string | null> {
  const { url, key } = supabaseEnv();
  const res = await fetch(`${url}/storage/v1/object/sign/${FEEDBACK_BUCKET}/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ expiresIn: expiresInSec }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { signedURL: string };
  return `${url}/storage/v1${data.signedURL}`;
}

// ── 通知 ──

export interface FeedbackNotifyInput {
  id: string;
  company: string;
  reporter: string;
  page: string;
  category: string;
  description: string;
  fileCount: number;
}

export async function notifyFeedback(input: FeedbackNotifyInput): Promise<void> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://huibang.com.tw";
  const adminUrl = `${base}/admin/client-feedback`;
  const summary = `${input.company}【${input.category}】${input.page}｜${input.reporter}：${input.description.slice(0, 100)}${input.description.length > 100 ? "…" : ""}（附件 ${input.fileCount} 件）`;

  // Email（Resend；失敗不擋提交）
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "惠邦行銷 <hello@huibang.com.tw>",
      to: process.env.NOTIFY_EMAIL || "service@huibang.com.tw",
      subject: `🛠 系統回饋：${input.company}｜${input.category}｜${input.page}`,
      html: `
        <div style="font-family:'Noto Sans TC',sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#1E293B;">客戶系統回饋</h2>
          <p style="color:#64748B;font-size:14px;margin:4px 0 12px;">${input.company}</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:6px 0;color:#64748B;width:90px;">反應人</td><td>${input.reporter}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B;">類別</td><td>${input.category}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B;">系統頁面</td><td>${input.page}</td></tr>
            <tr><td style="padding:6px 0;color:#64748B;">附件</td><td>${input.fileCount} 件</td></tr>
          </table>
          <p style="white-space:pre-wrap;background:#F8FAFC;padding:12px;border-radius:8px;">${input.description}</p>
          <a href="${adminUrl}" style="display:inline-block;background:#F97316;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">後台檢視</a>
        </div>`,
    });
  } catch (e) {
    console.error("feedback email notify failed", e);
  }

  // Discord webhook（選配：DISCORD_FEEDBACK_WEBHOOK_URL 未設定即略過）
  const webhook = process.env.DISCORD_FEEDBACK_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: `🛠 客戶系統回饋\n${summary}\n${adminUrl}` }),
      });
    } catch (e) {
      console.error("feedback discord notify failed", e);
    }
  }
}
