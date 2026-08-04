"use client";

import { useActionState, useState } from "react";
import { sendWebinarInviteAction, type WebinarInviteState } from "./actions";

const inputCls =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500";

export function InviteForm() {
  const [state, formAction, pending] = useActionState<WebinarInviteState, FormData>(sendWebinarInviteAction, {});
  const [link, setLink] = useState("");
  const hasPwd = /[?&]pwd=/.test(link);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">講座名稱</label>
          <input name="title" required maxLength={200} placeholder="如：AI 行銷實戰講座" className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">講座時間（信件顯示文字）</label>
          <input name="meetingTime" required maxLength={100} placeholder="如：2026/8/15（六）14:00–16:00" className={inputCls} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Zoom 邀請連結</label>
        <input
          name="zoomLink"
          required
          value={link}
          onChange={(e) => setLink(e.target.value.trim())}
          placeholder="https://us06web.zoom.us/j/1234567890?pwd=…"
          className={inputCls}
        />
        {link && (
          <p className={`mt-1 text-xs ${hasPwd ? "text-emerald-600" : "text-amber-600"}`}>
            {hasPwd
              ? "✓ 連結已內嵌密碼，收件人點按鈕即可直接入會"
              : "⚠ 此連結未內嵌密碼（無 pwd 參數）——收件人點按鈕後仍需輸入密碼。建議至 Zoom 設定開啟「在邀請連結中嵌入密碼」後重新複製連結"}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">會議 ID</label>
          <input name="meetingId" required maxLength={30} placeholder="123 4567 8901" className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">會議密碼</label>
          <input name="passcode" required maxLength={30} className={inputCls} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">詳細資訊（選填，顯示於信件內文）</label>
        <textarea name="note" rows={3} maxLength={2000} placeholder="講師介紹、注意事項、建議提前 10 分鐘入會…" className={inputCls} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">收件人 Email（每行一個或逗號分隔，上限 200）</label>
        <textarea name="recipients" required rows={5} placeholder={"a@example.com\nb@example.com"} className={inputCls} />
      </div>

      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.success}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
      >
        {pending ? "寄送中…" : "寄出邀請信"}
      </button>
    </form>
  );
}
