import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { clientFeedback } from "@/lib/db/schema";
import { feedbackSignedUrl } from "@/lib/client-feedback";
import { updateFeedbackAction } from "./actions";

// 客戶系統回饋列表（server component；附件走 1 小時簽名連結）
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  new: "新回饋",
  logged: "處理中（已登記）",
  waiting_client: "待客戶提供資料",
  acceptance: "已上線待驗收",
  closed: "已結案",
};

interface FeedbackFile {
  path: string;
  name: string;
  type: string;
  size: number;
}

export default async function ClientFeedbackAdminPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const rows = await db.select().from(clientFeedback).orderBy(desc(clientFeedback.createdAt)).limit(100);

  const withUrls = await Promise.all(
    rows.map(async (r) => ({
      ...r,
      fileLinks: await Promise.all(
        ((r.files as FeedbackFile[]) ?? []).map(async (f) => ({
          ...f,
          url: await feedbackSignedUrl(f.path),
        })),
      ),
    })),
  );

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-900">客戶系統回饋</h1>
      <p className="mt-1 text-sm text-gray-500">
        客戶自 /client-feedback 提交（通行碼識別公司）。處理流程：登記進該客戶專案的 FEEDBACK-LOG → 修復 → 回覆辦理情況。附件連結有效 1 小時。
      </p>

      <div className="mt-6 space-y-4">
        {withUrls.length === 0 && <p className="text-sm text-gray-400">尚無回饋</p>}
        {withUrls.map((r) => (
          <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    r.status === "new"
                      ? "bg-red-100 text-red-700"
                      : r.status === "logged"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                  }`}
                >
                  {STATUS_LABELS[r.status] ?? r.status}
                </span>
                <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{r.company}</span>
                <span className="font-semibold text-gray-900">{r.category}</span>
                <span className="text-gray-500">{r.page}</span>
                <span className="text-gray-400">｜{r.reporter}</span>
              </div>
              <span className="text-xs text-gray-400">
                {r.createdAt.toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{r.description}</p>
            {r.expected && <p className="mt-1 text-sm text-gray-500">期望結果：{r.expected}</p>}
            {/* 處理狀態與客戶可見回覆（存檔即同步客戶處理進度頁） */}
            <form action={updateFeedbackAction} className="mt-3 rounded-lg bg-gray-50 p-3">
              <input type="hidden" name="id" value={r.id} />
              <div className="flex flex-wrap items-end gap-2">
                <div>
                  <label className="block text-xs text-gray-500">狀態</label>
                  <select name="status" defaultValue={r.status} className="mt-0.5 rounded-md border border-gray-300 px-2 py-1.5 text-sm">
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500">FB 編號</label>
                  <input name="fbNo" defaultValue={r.fbNo ?? ""} placeholder="FB-055" className="mt-0.5 w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm" />
                </div>
                <div className="min-w-64 flex-1">
                  <label className="block text-xs text-gray-500">處理回覆（客戶可見）</label>
                  <textarea name="reply" defaultValue={r.reply ?? ""} rows={2} className="mt-0.5 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm" />
                </div>
                <button type="submit" className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
                  儲存
                </button>
              </div>
            </form>
            {r.fileLinks.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {r.fileLinks.map((f, i) =>
                  f.url ? (
                    <a
                      key={i}
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-200"
                    >
                      {f.type.startsWith("video/") ? "🎬" : "🖼"} {f.name}
                    </a>
                  ) : (
                    <span key={i} className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-400">
                      {f.name}（連結失效）
                    </span>
                  ),
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
