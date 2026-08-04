import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { clientFeedback, clientFeedbackComments } from "@/lib/db/schema";
import { feedbackSignedUrl } from "@/lib/client-feedback";
import { AcceptButton } from "./accept-button";
import { CommentForm } from "./comment-form";

// 處理進度（2026-08-04 拍板：歷史全放＋「待貴司提供」突顯）。
// 客戶可見狀態四種：處理中／待貴司提供資料／已上線待驗收／已結案。

const STATUS_VIEW: Record<string, { label: string; cls: string }> = {
  new: { label: "處理中", cls: "bg-blue-100 text-blue-700" },
  logged: { label: "處理中", cls: "bg-blue-100 text-blue-700" },
  waiting_client: { label: "待貴司提供資料", cls: "bg-amber-100 text-amber-800" },
  acceptance: { label: "已上線待驗收", cls: "bg-violet-100 text-violet-700" },
  closed: { label: "已結案", cls: "bg-emerald-100 text-emerald-700" },
};

interface FeedbackFile {
  path: string;
  name: string;
  type: string;
  size: number;
}

export async function ProgressList({ company }: { company: string }) {
  const rows = await db
    .select()
    .from(clientFeedback)
    .where(and(eq(clientFeedback.company, company)))
    .orderBy(desc(clientFeedback.createdAt))
    .limit(200);

  const comments = rows.length
    ? await db
        .select()
        .from(clientFeedbackComments)
        .where(inArray(clientFeedbackComments.feedbackId, rows.map((r) => r.id)))
        .orderBy(clientFeedbackComments.createdAt)
    : [];
  const commentsWithUrls = await Promise.all(
    comments.map(async (c) => ({
      ...c,
      fileLinks: await Promise.all(
        (Array.isArray(c.files) ? (c.files as FeedbackFile[]) : []).map(async (f) => ({
          ...f,
          url: await feedbackSignedUrl(f.path),
        })),
      ),
    })),
  );
  const commentsByFeedback = new Map<string, typeof commentsWithUrls>();
  for (const c of commentsWithUrls) {
    const list = commentsByFeedback.get(c.feedbackId) ?? [];
    list.push(c);
    commentsByFeedback.set(c.feedbackId, list);
  }

  const withUrls = await Promise.all(
    rows.map(async (r) => ({
      ...r,
      fileLinks: await Promise.all(
        (Array.isArray(r.files) ? (r.files as FeedbackFile[]) : []).map(async (f) => ({
          ...f,
          url: await feedbackSignedUrl(f.path),
        })),
      ),
    })),
  );

  const waiting = withUrls.filter((r) => r.status === "waiting_client");
  const stats = {
    total: withUrls.length,
    closed: withUrls.filter((r) => r.status === "closed").length,
    acceptance: withUrls.filter((r) => r.status === "acceptance").length,
  };

  const Card = ({ r }: { r: (typeof withUrls)[number] }) => {
    const view = STATUS_VIEW[r.status] ?? STATUS_VIEW.new!;
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${view.cls}`}>{view.label}</span>
            <span className="text-xs text-slate-400">{r.fbNo ?? ""}</span>
            <span className="font-medium text-slate-700">{r.page}</span>
            <span className="text-xs text-slate-400">{r.category}</span>
          </div>
          <span className="text-xs text-slate-400">{r.createdAt.toISOString().slice(0, 10)}</span>
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm font-medium text-slate-800">{r.description}</p>
        {r.reply && (
          <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-xs font-medium text-slate-400">處理回覆</p>
            <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-600">{r.reply}</p>
          </div>
        )}
        {r.fileLinks.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {r.fileLinks.map((f, i) =>
              f.url ? (
                <a key={i} href={f.url} target="_blank" rel="noreferrer" className="rounded-lg bg-slate-100 px-3 py-1 text-xs text-slate-600 hover:bg-slate-200">
                  {f.type.startsWith("video/") ? "🎬" : "🖼"} {f.name}
                </a>
              ) : null,
            )}
          </div>
        )}
        {/* 留言串（提供資料/往來紀錄） */}
        {(commentsByFeedback.get(r.id) ?? []).length > 0 && (
          <div className="mt-3 space-y-2 border-t border-slate-100 pt-2">
            {(commentsByFeedback.get(r.id) ?? []).map((c) => (
              <div key={c.id} className={`rounded-lg px-3 py-2 text-sm ${c.author === "client" ? "bg-orange-50" : "bg-slate-100"}`}>
                <p className="text-xs font-medium text-slate-400">
                  {c.author === "client" ? `貴司${c.authorName ? `（${c.authorName}）` : ""}` : "惠邦"}｜{c.createdAt.toISOString().slice(0, 10)}
                </p>
                <p className="mt-0.5 whitespace-pre-wrap text-slate-700">{c.body}</p>
                {c.fileLinks.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {c.fileLinks.map((f, i) =>
                      f.url ? (
                        <a key={i} href={f.url} target="_blank" rel="noreferrer" className="rounded bg-white px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-50">
                          📎 {f.name}
                        </a>
                      ) : null,
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {r.status === "acceptance" && <AcceptButton id={r.id} />}
        {r.status !== "closed" && <CommentForm feedbackId={r.id} prominent={r.status === "waiting_client"} />}
        {r.status === "closed" && r.acceptedAt && (
          <p className="mt-2 text-xs text-emerald-600">✓ 貴司已於 {r.acceptedAt.toISOString().slice(0, 10)} 驗收通過</p>
        )}
      </div>
    );
  };

  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm text-slate-500">
        共 {stats.total} 項：已結案 {stats.closed}、待貴司驗收 {stats.acceptance}、其餘處理中或等待資料。「已上線待驗收」項目測試無誤後請按「驗收通過」結案；「待貴司提供」項目請點「提供資料」上傳檔案或留言。
      </p>

      {/* 待貴司提供資料（突顯區） */}
      {waiting.length > 0 && (
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
          <h2 className="text-sm font-bold text-amber-800">⏳ 等待貴司提供（{waiting.length} 項）——提供後我們即可繼續</h2>
          <div className="mt-3 space-y-3">
            {waiting.map((r) => (
              <Card key={r.id} r={r} />
            ))}
          </div>
        </div>
      )}

      {withUrls
        .filter((r) => r.status !== "waiting_client")
        .map((r) => (
          <Card key={r.id} r={r} />
        ))}
    </div>
  );
}
