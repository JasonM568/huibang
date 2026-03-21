"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

const SHEET_URLS: Record<string, string> = {
  "1": "https://docs.google.com/spreadsheets/d/1uVZDt6c6TZ9pn3lLNY5riWUAti1i88d0Eg164X86-o8/edit?usp=sharing",
  "2": "https://docs.google.com/spreadsheets/d/1zifC9U1smty22qlrugaV-JiWOj6jnQUtooPf4keMoeE/edit?usp=sharing",
  "3": "https://docs.google.com/spreadsheets/d/1TY6ZvifbdzSta-KmzcwBJKwJxmmwon7NCSCRYzQR74o/edit?usp=sharing",
};

const PLAN_NAMES: Record<string, string> = {
  "2": "小當家組（5 位 AI Agent）",
  "3": "總舖師組（10 位 AI Agent）",
};

const PLAN_PRICES: Record<string, number> = {
  "2": 1299,
  "3": 2999,
};

export default function AiPackPaymentSuccessPage() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan") || "3";
  const planName = PLAN_NAMES[planId] || PLAN_NAMES["3"];
  const sheetUrl = SHEET_URLS[planId] || SHEET_URLS["3"];
  const amount = Number(searchParams.get("amount")) || PLAN_PRICES[planId] || 2999;
  const tradeNo = searchParams.get("trade_no") || "";

  // Meta Pixel: Purchase + GA4: purchase（用 tradeNo 防止重複觸發）
  useEffect(() => {
    const key = `__purchase_fired_${tradeNo}`;
    if ((window as Record<string, unknown>)[key]) return;
    (window as Record<string, unknown>)[key] = true;

    // Meta Pixel Purchase
    if (window.fbq) {
      window.fbq("track", "Purchase", {
        content_ids: [`ai-pack-plan-${planId}`],
        content_name: planName,
        content_type: "product",
        value: amount,
        currency: "TWD",
      });
    }

    // GA4 purchase
    if (window.gtag) {
      window.gtag("event", "purchase", {
        transaction_id: tradeNo,
        value: amount,
        currency: "TWD",
        items: [{
          item_id: `ai-pack-plan-${planId}`,
          item_name: planName,
          price: amount,
          quantity: 1,
        }],
      });
    }
  }, [planId, planName, amount, tradeNo]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          付款成功！
        </h1>
        <p className="text-gray-500 mb-2">
          {planName}
        </p>
        <p className="text-gray-600 text-base leading-relaxed mb-8">
          你的 AI Agent 已準備就緒，點擊下方按鈕前往領取
        </p>

        {/* Main CTA */}
        <a
          href={sheetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-full max-w-xs px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5 text-lg"
        >
          前往領取 AI Agent →
        </a>

        {/* Steps */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 text-left mt-8 mb-8">
          <h2 className="font-bold text-gray-900 mb-4">接下來的步驟</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p className="font-medium text-gray-900 text-sm">點擊上方按鈕</p>
                <p className="text-gray-500 text-xs mt-0.5">前往查看你的 AI Agent 連結清單</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <p className="font-medium text-gray-900 text-sm">點擊 GPT 連結</p>
                <p className="text-gray-500 text-xs mt-0.5">使用你的 ChatGPT 帳號登入即可使用</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p className="font-medium text-gray-900 text-sm">開始使用 AI Agent</p>
                <p className="text-gray-500 text-xs mt-0.5">直接用中文跟 AI 對話，說出你的需求</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <p className="text-amber-800 text-sm">
            📧 連結也已寄送至你的 Email，請查收。如未收到請檢查垃圾郵件夾，或聯繫{" "}
            <a href="mailto:service@huibang.com.tw" className="underline font-medium">
              service@huibang.com.tw
            </a>
          </p>
        </div>

        <Link href="/ai/restaurant-pack" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← 回到 AI 個體包介紹頁
        </Link>
      </div>
    </div>
  );
}
