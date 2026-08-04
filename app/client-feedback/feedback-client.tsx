"use client";

import { useRef, useState } from "react";

const PAGES = ["訂單", "維修單", "工作報表", "佈告欄", "考勤", "薪資", "業績儀表板", "商品/庫存", "其他"];
const CATEGORIES = [
  { value: "bug", label: "系統問題（功能異常）" },
  { value: "需求", label: "功能需求（想新增或調整）" },
  { value: "操作問題", label: "操作問題（不確定怎麼使用）" },
];

const MAX_VIDEO_SECONDS = 125; // 1–2 分鐘，寬限 5 秒
const inputCls =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500";

interface PickedFile {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  path?: string;
}

export function FeedbackClient({ initialAuthed }: { initialAuthed: boolean }) {
  const [authed, setAuthed] = useState(initialAuthed);
  const [code, setCode] = useState("");
  const [gateError, setGateError] = useState<string | null>(null);
  const [gateBusy, setGateBusy] = useState(false);

  const [reporter, setReporter] = useState("");
  const [page, setPage] = useState(PAGES[0]!);
  const [category, setCategory] = useState("bug");
  const [description, setDescription] = useState("");
  const [expected, setExpected] = useState("");
  const [picked, setPicked] = useState<PickedFile[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const enterCode = async () => {
    setGateBusy(true);
    setGateError(null);
    try {
      const res = await fetch("/api/client-feedback/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setGateError(data.error ?? "驗證失敗");
        return;
      }
      setAuthed(true);
    } finally {
      setGateBusy(false);
    }
  };

  const videoDuration = (file: File) =>
    new Promise<number | null>((resolve) => {
      const url = URL.createObjectURL(file);
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(v.duration);
      };
      v.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      v.src = url;
    });

  const onPickFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError(null);
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    const next: PickedFile[] = [];
    for (const f of files) {
      if (picked.length + next.length >= 10) {
        setFormError("附件最多 10 件");
        break;
      }
      if (f.type.startsWith("video/")) {
        const dur = await videoDuration(f);
        if (dur !== null && dur > MAX_VIDEO_SECONDS) {
          setFormError(`影片「${f.name}」超過 2 分鐘，請剪短後再上傳`);
          continue;
        }
        if (f.size > 200 * 1024 * 1024) {
          setFormError(`影片「${f.name}」超過 200MB，請壓縮後再上傳`);
          continue;
        }
      } else if (f.size > 10 * 1024 * 1024) {
        setFormError(`圖片「${f.name}」超過 10MB`);
        continue;
      }
      next.push({ file: f, status: "pending" });
    }
    setPicked((prev) => [...prev, ...next]);
  };

  const submit = async () => {
    setFormError(null);
    if (!reporter.trim()) return setFormError("請填寫反應人姓名");
    if (!description.trim()) return setFormError("請填寫問題描述");
    setSubmitting(true);
    try {
      // 逐檔直傳 Supabase Storage（大影片不經網站主機）
      const uploaded: Array<{ path: string; name: string; type: string; size: number }> = [];
      for (const [i, pf] of picked.entries()) {
        if (pf.status === "done" && pf.path) {
          uploaded.push({ path: pf.path, name: pf.file.name, type: pf.file.type, size: pf.file.size });
          continue;
        }
        setPicked((prev) => prev.map((x, j) => (j === i ? { ...x, status: "uploading" } : x)));
        const urlRes = await fetch("/api/client-feedback/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: pf.file.name, contentType: pf.file.type, size: pf.file.size }),
        });
        if (!urlRes.ok) {
          const data = (await urlRes.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? `「${pf.file.name}」上傳失敗`);
        }
        const { uploadUrl, path } = (await urlRes.json()) as { uploadUrl: string; path: string };
        const putRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": pf.file.type },
          body: pf.file,
        });
        if (!putRes.ok) throw new Error(`「${pf.file.name}」上傳失敗，請重試`);
        uploaded.push({ path, name: pf.file.name, type: pf.file.type, size: pf.file.size });
        setPicked((prev) => prev.map((x, j) => (j === i ? { ...x, status: "done", path } : x)));
      }

      const res = await fetch("/api/client-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporter,
          page,
          category,
          description,
          expected: expected || undefined,
          files: uploaded,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; id?: string; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "送出失敗，請稍後再試");
      setDoneId(data.id ?? "");
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "送出失敗，請稍後再試");
      setPicked((prev) => prev.map((x) => (x.status === "uploading" ? { ...x, status: "error" } : x)));
    } finally {
      setSubmitting(false);
    }
  };

  if (!authed) {
    return (
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-700">此頁面僅供合作客戶使用，請輸入通行碼。</p>
        <div className="mt-3 flex gap-2">
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !gateBusy && enterCode()}
            placeholder="通行碼"
            className={inputCls}
          />
          <button
            type="button"
            onClick={enterCode}
            disabled={gateBusy || !code.trim()}
            className="mt-1 shrink-0 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {gateBusy ? "驗證中…" : "進入"}
          </button>
        </div>
        {gateError && <p className="mt-2 text-sm text-red-600">{gateError}</p>}
      </div>
    );
  }

  if (doneId !== null) {
    return (
      <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <p className="font-medium text-emerald-800">✓ 已收到您的回饋，我們會盡快處理並回覆辦理情況。</p>
        <button
          type="button"
          onClick={() => {
            setDoneId(null);
            setDescription("");
            setExpected("");
            setPicked([]);
          }}
          className="mt-3 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm text-emerald-800 hover:bg-emerald-100"
        >
          再填一筆
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">反應人姓名</label>
          <input value={reporter} onChange={(e) => setReporter(e.target.value)} maxLength={100} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">系統頁面</label>
          <select value={page} onChange={(e) => setPage(e.target.value)} className={inputCls}>
            {PAGES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">問題類別</label>
        <div className="mt-2 space-y-2">
          {CATEGORIES.map((c) => (
            <label key={c.value} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="category"
                value={c.value}
                checked={category === c.value}
                onChange={() => setCategory(c.value)}
                className="accent-orange-500"
              />
              {c.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">問題描述</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          maxLength={5000}
          placeholder="請描述發生什麼事、在哪個畫面、操作了什麼（越具體處理越快）"
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">期望結果（選填）</label>
        <input
          value={expected}
          onChange={(e) => setExpected(e.target.value)}
          maxLength={2000}
          placeholder="希望系統怎麼運作"
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">附件（截圖或錄影）</label>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
          onChange={onPickFiles}
          className="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-orange-600 hover:file:bg-orange-100"
        />
        <p className="mt-1 text-xs text-slate-400">
          圖片 jpg/png/webp（每張 ≤10MB）；影片 mp4/mov（限 1–2 分鐘、≤200MB）。最多 10 件。
        </p>
        {picked.length > 0 && (
          <ul className="mt-2 space-y-1">
            {picked.map((pf, i) => (
              <li key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                <span className="truncate">
                  {pf.file.type.startsWith("video/") ? "🎬" : "🖼"} {pf.file.name}
                  <span className="ml-2 text-xs text-slate-400">{(pf.file.size / 1024 / 1024).toFixed(1)}MB</span>
                </span>
                <span className="ml-2 shrink-0 text-xs">
                  {pf.status === "uploading" && <span className="text-orange-600">上傳中…</span>}
                  {pf.status === "done" && <span className="text-emerald-600">✓</span>}
                  {pf.status === "error" && <span className="text-red-600">失敗</span>}
                  {pf.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => setPicked((prev) => prev.filter((_, j) => j !== i))}
                      className="text-slate-400 underline-offset-2 hover:underline"
                    >
                      移除
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={submitting}
        className="w-full rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
      >
        {submitting ? "送出中（附件上傳可能需要一點時間）…" : "送出回饋"}
      </button>
    </div>
  );
}
