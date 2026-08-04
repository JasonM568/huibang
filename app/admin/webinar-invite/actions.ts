"use server";

import { Resend } from "resend";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { webinarInvites } from "@/lib/db/schema";

export interface WebinarInviteState {
  error?: string;
  success?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 講座邀請寄送（2026-08-04）：一鍵入會按鈕＋明列會議 ID/密碼/時間/說明；逐一寄送不揭露名單。 */
export async function sendWebinarInviteAction(
  _prev: WebinarInviteState,
  formData: FormData,
): Promise<WebinarInviteState> {
  const session = await getSession();
  if (!session) return { error: "請重新登入" };

  const title = String(formData.get("title") ?? "").trim();
  const meetingTime = String(formData.get("meetingTime") ?? "").trim();
  const zoomLink = String(formData.get("zoomLink") ?? "").trim();
  const meetingId = String(formData.get("meetingId") ?? "").trim();
  const passcode = String(formData.get("passcode") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const recipientsRaw = String(formData.get("recipients") ?? "");

  if (!title || title.length > 200) return { error: "請填寫講座名稱" };
  if (!meetingTime) return { error: "請填寫講座時間" };
  if (!/^https:\/\/[\w.-]+\.zoom\.us\//.test(zoomLink)) return { error: "Zoom 連結格式錯誤（須為 https://…zoom.us/…）" };
  if (!meetingId) return { error: "請填寫會議 ID" };
  if (!passcode) return { error: "請填寫會議密碼" };

  const recipients = [...new Set(
    recipientsRaw
      .split(/[\n,;，；\s]+/)
      .map((e) => e.trim())
      .filter(Boolean),
  )];
  if (recipients.length === 0) return { error: "請填寫至少一個收件人 Email" };
  const invalid = recipients.filter((e) => !EMAIL_RE.test(e));
  if (invalid.length > 0) return { error: `Email 格式錯誤：${invalid.slice(0, 3).join("、")}` };
  if (recipients.length > 200) return { error: "單次寄送上限 200 人" };

  const hasEmbeddedPwd = /[?&]pwd=/.test(zoomLink);
  const html = `
    <div style="font-family:'Noto Sans TC',sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#F97316,#EA580C);padding:28px;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;font-size:22px;margin:0;">${title}</h1>
        <p style="color:#FFEDD5;margin:6px 0 0;font-size:14px;">線上講座邀請</p>
      </div>
      <div style="background:#fff;padding:28px;border:1px solid #E2E8F0;border-top:0;border-radius:0 0 12px 12px;">
        <table style="width:100%;border-collapse:collapse;font-size:15px;">
          <tr><td style="padding:8px 0;color:#64748B;width:90px;">時間</td><td style="color:#1E293B;font-weight:600;">${meetingTime}</td></tr>
          <tr><td style="padding:8px 0;color:#64748B;">會議 ID</td><td style="color:#1E293B;font-weight:600;">${meetingId}</td></tr>
          <tr><td style="padding:8px 0;color:#64748B;">密碼</td><td style="color:#1E293B;font-weight:600;">${passcode}</td></tr>
        </table>
        ${note ? `<p style="white-space:pre-wrap;background:#F8FAFC;padding:14px;border-radius:8px;color:#334155;font-size:14px;">${note}</p>` : ""}
        <div style="text-align:center;margin:24px 0 8px;">
          <a href="${zoomLink}" style="display:inline-block;background:#F97316;color:#fff;padding:14px 36px;border-radius:10px;text-decoration:none;font-size:16px;font-weight:700;">🎦 一鍵加入講座</a>
        </div>
        <p style="color:#94A3B8;font-size:12px;text-align:center;">
          ${hasEmbeddedPwd ? "點按鈕即可直接入會，無需輸入密碼；" : ""}若按鈕無法開啟，請開啟 Zoom 後輸入上方會議 ID 與密碼加入。
        </p>
        <p style="color:#94A3B8;font-size:12px;text-align:center;">連結網址：${zoomLink}</p>
      </div>
    </div>`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  let sent = 0;
  const failed: string[] = [];
  for (const to of recipients) {
    try {
      const { error } = await resend.emails.send({
        from: "惠邦行銷 <hello@huibang.com.tw>",
        replyTo: process.env.NOTIFY_EMAIL || "service@huibang.com.tw",
        to,
        subject: `【講座邀請】${title}｜${meetingTime}`,
        html,
      });
      if (error) failed.push(to);
      else sent++;
    } catch {
      failed.push(to);
    }
  }

  await db.insert(webinarInvites).values({
    title,
    meetingTime,
    zoomLink,
    meetingId,
    passcode,
    note: note || null,
    recipients,
    sentCount: sent,
    createdBy: session.email,
  });

  if (failed.length > 0) {
    return { error: `已寄出 ${sent} 封；失敗 ${failed.length} 封：${failed.slice(0, 5).join("、")}${failed.length > 5 ? "…" : ""}` };
  }
  return { success: `已寄出 ${sent} 封邀請信${hasEmbeddedPwd ? "" : "（提醒：此連結未內嵌密碼，收件人點按鈕後仍需輸入密碼；建議至 Zoom 開啟「在邀請連結中嵌入密碼」後用新連結）"}` };
}
