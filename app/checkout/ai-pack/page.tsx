"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const PLANS: Record<string, { name: string; agents: number; price: number; originalPrice: number }> = {
  "1": { name: "入門方案", agents: 2, price: 990, originalPrice: 1980 },
  "2": { name: "進階方案", agents: 6, price: 1990, originalPrice: 4680 },
  "3": { name: "全配方案", agents: 10, price: 3990, originalPrice: 9880 },
};

const PLAN_GPTS: Record<string, string[]> = {
  "1": ["今日社群貼文機", "活動企劃師"],
  "2": ["今日社群貼文機", "活動企劃師", "菜單設計顧問", "Google 評論回覆手", "LINE/客服訊息管家", "食材成本計算機"],
  "3": ["今日社群貼文機", "活動企劃師", "菜單設計顧問", "Google 評論回覆手", "LINE/客服訊息管家", "食材成本計算機", "徵人文案+面試題庫", "廣告投放教練", "每月營運覆盤師", "老闆決策顧問"],
};

export default function AiPackCheckoutPage() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan") || "3";
  const plan = PLANS[planId] || PLANS["3"];
  const gptList = PLAN_GPTS[planId] || PLAN_GPTS["3"];

  const [form, setForm] = useState({ email: "", contactName: "", carrierNum: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 如果 planId 無效，fallback 到全配
  const effectivePlanId = PLANS[planId] ? planId : "3";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email) {
      setError("請填寫 Email");
      return;
    }
    if (form.carrierNum && !/^\/[A-Z0-9.+-]{7}$/.test(form.carrierNum)) {
      setError("手機條碼格式不正確（應為 / 開頭的 8 碼）");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/ecpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          product: "ai-pack",
          planId: effectivePlanId,
        }),
      });

      if (!res.ok) {
        setError("建立訂單失敗，請稍後再試");
        setSubmitting(false);
        return;
      }

      const html = await res.text();
      const newWindow = document.open();
      if (newWindow) {
        newWindow.write(html);
        newWindow.close();
      }
    } catch {
      setError("網路錯誤，請稍後再試");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/ai/restaurant-pack" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← 回 AI 個體包介紹頁
          </Link>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-sm font-medium">
            🤖 AI 個體包
          </div>
          <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-gray-900">
            {plan.name}
          </h1>
          <p className="mt-2 text-gray-500">
            {plan.agents} 位專為餐飲業設計的 AI Agent
          </p>
        </div>

        {/* Product Card */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">訂單內容</h2>
              <div className="text-right">
                <span className="text-sm text-gray-400 line-through mr-2">
                  NT$ {plan.originalPrice.toLocaleString()}
                </span>
                <span className="text-3xl font-extrabold text-emerald-600">
                  NT$ {plan.price.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-sm text-gray-600">
              {gptList.map((name) => (
                <div key={name} className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>{name}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <p className="text-emerald-800 text-xs font-medium">
                🎉 限時特價省 NT$ {(plan.originalPrice - plan.price).toLocaleString()}，付款後立即開通
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="border-t-2 border-gray-100 p-6 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-4">付款資訊</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 transition-colors"
                />
                <p className="mt-1 text-xs text-gray-400">
                  付款成功後，AI Agent 連結將寄送至此 Email
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  姓名（選填）
                </label>
                <input
                  type="text"
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  placeholder="你的名字"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  手機條碼載具（選填）
                </label>
                <input
                  type="text"
                  value={form.carrierNum}
                  onChange={(e) => setForm({ ...form, carrierNum: e.target.value.toUpperCase() })}
                  placeholder="/ 開頭 8 碼，例如 /ABC1234"
                  maxLength={8}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 transition-colors"
                />
                <p className="mt-1 text-xs text-gray-400">
                  如需存入手機條碼載具請填入，未填則以 Email 寄送電子發票
                </p>
              </div>

              {error && (
                <p className="text-red-500 text-sm font-medium">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all text-base"
              >
                {submitting
                  ? "前往付款中..."
                  : `前往付款 NT$ ${plan.price.toLocaleString()}`}
              </button>

              <p className="text-center text-xs text-gray-400">
                由綠界科技 ECPay 安全處理付款
              </p>
            </form>
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-3 text-sm text-gray-500">
          <details className="group">
            <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
              付款後怎麼領取 AI Agent？
            </summary>
            <p className="mt-2 pl-1">付款成功後會立即顯示領取頁面，同時 Email 也會收到 AI Agent 連結。</p>
          </details>
          <details className="group">
            <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
              需要什麼才能使用？
            </summary>
            <p className="mt-2 pl-1">需要一個 ChatGPT 帳號（免費版可用部分功能，Plus 版體驗最佳）。</p>
          </details>
          <details className="group">
            <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
              可以之後升級方案嗎？
            </summary>
            <p className="mt-2 pl-1">可以！如果之後想升級到更多 AI Agent，歡迎聯繫我們。</p>
          </details>
        </div>

        {/* Switch plan */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 mb-2">其他方案</p>
          <div className="flex gap-3 justify-center">
            {Object.entries(PLANS).map(([id, p]) => (
              id !== effectivePlanId && (
                <Link
                  key={id}
                  href={`/checkout/ai-pack?plan=${id}`}
                  className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                >
                  {p.name} NT${p.price.toLocaleString()}
                </Link>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
