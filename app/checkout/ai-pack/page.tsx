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

  const [form, setForm] = useState({ email: "", contactName: "", phone: "", carrierNum: "", agreed: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showTerms, setShowTerms] = useState(false);

  // 如果 planId 無效，fallback 到全配
  const effectivePlanId = PLANS[planId] ? planId : "3";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email) {
      setError("請填寫 Email");
      return;
    }
    if (!form.contactName.trim()) {
      setError("請填寫姓名");
      return;
    }
    if (!form.phone) {
      setError("請填寫手機號碼");
      return;
    }
    if (!/^09\d{8}$/.test(form.phone)) {
      setError("手機號碼格式不正確（應為 09 開頭的 10 碼）");
      return;
    }
    if (form.carrierNum && !/^\/[A-Z0-9.+-]{7}$/.test(form.carrierNum)) {
      setError("手機條碼格式不正確（應為 / 開頭的 8 碼）");
      return;
    }
    if (!form.agreed) {
      setError("請先閱讀並同意購買條款");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/ecpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          contactName: form.contactName,
          phone: form.phone,
          carrierNum: form.carrierNum,
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
                  姓名 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  placeholder="你的姓名"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  手機號碼 <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                  placeholder="0912345678"
                  maxLength={10}
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

              {/* 購買條款同意書 */}
              <div className="border-2 border-gray-200 rounded-xl p-4 bg-white">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.agreed}
                    onChange={(e) => setForm({ ...form, agreed: e.target.checked })}
                    className="mt-0.5 w-4 h-4 accent-emerald-600 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    我已閱讀並同意{" "}
                    <button
                      type="button"
                      onClick={() => setShowTerms(!showTerms)}
                      className="text-emerald-600 underline hover:text-emerald-700"
                    >
                      數位商品購買條款
                    </button>
                    <span className="text-red-400"> *</span>
                  </span>
                </label>

                {showTerms && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 leading-relaxed space-y-2 max-h-60 overflow-y-auto">
                    <p className="font-semibold text-gray-800">惠邦行銷 數位商品購買條款</p>
                    <p>感謝您購買惠邦行銷有限公司（以下簡稱「本公司」）所提供之「AI 個體包」數位商品服務。請於付款前詳閱以下條款，完成付款即表示您已充分瞭解並同意本條款之全部內容。</p>
                    <p className="font-medium text-gray-700">一、商品性質</p>
                    <p>本商品為數位內容商品（客製化 AI Agent / GPTs），屬於以數位方式提供之非實體商品。商品於付款完成後，即透過電子郵件交付使用連結，無實體物品寄送。</p>
                    <p className="font-medium text-gray-700">二、退費政策</p>
                    <p>依據《消費者保護法》第 19 條第 1 項但書規定，本商品屬「非以有形媒介提供之數位內容」，經消費者事先同意始提供，且一經交付即無法回復原狀，故不適用七日猶豫期之無條件解除權。付款完成後恕不接受退費申請。</p>
                    <p className="font-medium text-gray-700">三、授權範圍</p>
                    <p>本商品之使用授權僅限購買者本人或其所經營之單一品牌使用，不得轉讓、轉售、複製或以任何形式提供予第三人使用。</p>
                    <p className="font-medium text-gray-700">四、智慧財產權</p>
                    <p>本商品中所包含之 AI Agent 架構、指令設計、品牌策略邏輯及相關內容，其智慧財產權均歸本公司所有。購買者取得之權利為使用授權，非著作權之讓與。</p>
                    <p className="font-medium text-gray-700">五、免責聲明</p>
                    <p>AI Agent 之產出內容係由人工智慧模型生成，本公司不保證其完全正確性或適用性。使用者應自行判斷並承擔使用 AI 產出內容之風險與責任。</p>
                    <p className="font-medium text-gray-700">六、爭議處理</p>
                    <p>本條款之解釋與適用，以中華民國法律為準據法。如因本條款發生爭議，雙方同意以臺灣臺北地方法院為第一審管轄法院。</p>
                    <p className="text-gray-400 mt-2">惠邦行銷有限公司</p>
                  </div>
                )}
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
