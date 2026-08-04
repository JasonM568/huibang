"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** 客戶驗收按鈕（2026-08-04）：已上線待驗收 → 按通過即結案 */
export function AcceptButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = async () => {
    if (!confirm("確認此項目已驗收無問題？按下後將標記為結案。")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/client-feedback/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "操作失敗，請稍後再試");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={accept}
        disabled={busy}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {busy ? "送出中…" : "✓ 驗收通過（結案）"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
