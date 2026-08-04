import type { Metadata } from "next";
import { hasFeedbackAccess } from "@/lib/client-feedback";
import { FeedbackClient } from "./feedback-client";

// 環安系統回饋表單（非公開）：不進 sitemap、noindex；通行碼閘門。
export const metadata: Metadata = {
  title: "系統回饋單",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ClientFeedbackPage() {
  const authed = await hasFeedbackAccess();
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-800">環安系統回饋單</h1>
        <p className="mt-1 text-sm text-slate-500">
          回報系統問題或需求：填寫描述並附上截圖／錄影（影片限 1–2 分鐘），送出後我們會登記處理並回覆辦理情況。
        </p>
        <FeedbackClient initialAuthed={authed} />
      </div>
    </main>
  );
}
