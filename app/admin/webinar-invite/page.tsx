import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { webinarInvites } from "@/lib/db/schema";
import { InviteForm } from "./invite-form";

// 講座邀請寄送（2026-08-04）：貼 Zoom 連結＋ID＋密碼＋名單 → 寄一鍵入會邀請信
export const dynamic = "force-dynamic";

export default async function WebinarInvitePage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const history = await db.select().from(webinarInvites).orderBy(desc(webinarInvites.createdAt)).limit(20);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-900">講座邀請寄送</h1>
      <p className="mt-1 text-sm text-gray-500">
        貼上 Zoom 邀請連結（建議先在 Zoom 開啟「在邀請連結中嵌入密碼」，收件人可一鍵入會）、會議 ID 與密碼，
        系統寄出含入會按鈕與完整資訊的邀請信；逐封寄送，收件人彼此看不到名單。
      </p>

      <div className="mt-6 max-w-2xl rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <InviteForm />
      </div>

      <h2 className="mt-8 text-sm font-semibold text-gray-700">寄送紀錄</h2>
      <div className="mt-2 space-y-2">
        {history.length === 0 && <p className="text-sm text-gray-400">尚無紀錄</p>}
        {history.map((h) => (
          <div key={h.id} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium text-gray-800">{h.title}</span>
              <span className="text-xs text-gray-400">
                {h.createdAt.toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}｜{h.createdBy}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">
              {h.meetingTime}｜ID {h.meetingId}｜寄出 {h.sentCount}/{Array.isArray(h.recipients) ? (h.recipients as string[]).length : 0} 封
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
