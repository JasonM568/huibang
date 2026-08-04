import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { feedbackAccessCompany } from "@/lib/client-feedback";
import { pagesForCompany } from "@/lib/feedback-clients";
import { FeedbackClient } from "./feedback-client";

// 客戶系統回饋表單（非公開，多客戶共用）：不進 sitemap、noindex；通行碼閘門，通行碼識別客戶。
export const metadata: Metadata = {
  title: "系統回饋單",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ClientFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const company = await feedbackAccessCompany();
  const { code } = await searchParams;
  // 專屬直達連結：?code=通行碼 → 設 cookie 後回到乾淨網址
  if (!company && code) redirect(`/api/client-feedback/auth?code=${encodeURIComponent(code)}`);
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-800">系統回饋單</h1>
        <p className="mt-1 text-sm text-slate-500">
          回報系統問題或需求：填寫描述並附上截圖／錄影（影片限 1–2 分鐘），送出後我們會登記處理並回覆辦理情況。
        </p>
        <FeedbackClient initialCompany={company} initialPages={company ? pagesForCompany(company) : []} />
      </div>
    </main>
  );
}
