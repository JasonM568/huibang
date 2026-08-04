"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** 項目留言/提供資料（2026-08-04）：文字＋附件（截圖/影片/PDF/Excel/Word），附件直傳 Storage */
export function CommentForm({ feedbackId, prominent }: { feedbackId: string; prominent: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!body.trim()) return setError("請填寫內容");
    setBusy(true);
    setError(null);
    try {
      const uploaded: Array<{ path: string; name: string; type: string; size: number }> = [];
      for (const f of files) {
        const urlRes = await fetch("/api/client-feedback/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: f.name, contentType: f.type, size: f.size }),
        });
        if (!urlRes.ok) {
          const data = (await urlRes.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? `「${f.name}」上傳失敗`);
        }
        const { uploadUrl, path } = (await urlRes.json()) as { uploadUrl: string; path: string };
        const putRes = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": f.type }, body: f });
        if (!putRes.ok) throw new Error(`「${f.name}」上傳失敗，請重試`);
        uploaded.push({ path, name: f.name, type: f.type, size: f.size });
      }
      const res = await fetch("/api/client-feedback/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackId, authorName: name || undefined, body, files: uploaded }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "送出失敗");
      setOpen(false);
      setBody("");
      setFiles([]);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "送出失敗，請稍後再試");
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          prominent
            ? "mt-3 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
            : "mt-3 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
        }
      >
        {prominent ? "📎 提供資料" : "留言"}
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          placeholder="您的姓名（選填）"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
        />
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,application/pdf,.xlsx,.xls,.csv,.docx"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 10))}
          className="text-sm text-slate-600 file:mr-2 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm"
        />
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        maxLength={3000}
        placeholder="說明提供的資料內容，或留言補充"
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
      />
      {files.length > 0 && (
        <p className="mt-1 text-xs text-slate-500">附件：{files.map((f) => f.name).join("、")}</p>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
        >
          {busy ? "送出中…" : "送出"}
        </button>
        <button type="button" onClick={() => setOpen(false)} disabled={busy} className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:text-slate-700">
          取消
        </button>
      </div>
    </div>
  );
}
