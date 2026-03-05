"use client";

import { useState } from "react";
import Link from "next/link";

export default function DiagnosticCheckoutPage() {
  const [form, setForm] = useState({ email: "", contactName: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email) {
      setError("請填寫 Email");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/ecpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        setError("建立訂單失敗，請稍後再試");
        setSubmitting(false);
        return;
      }

      // API 回傳 HTML 表單，自動提交到綠界
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
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← 回惠邦行銷官網
          </Link>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium">
            🔬 AI 深度健診
          </div>
          <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-gray-900">
            AI 社群帳號深度健診
          </h1>
          <p className="mt-2 text-gray-500">
            21 題深度問卷 × AI 即時分析 = 專屬社群健診報告
          </p>
        </div>

        {/* Product Card */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">訂單內容</h2>
              <div className="text-right">
                <span className="text-3xl font-extrabold text-indigo-600">NT$ 999</span>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>21 題深度社群帳號分析問卷</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>AI 即時產出 6 大維度專屬報告</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>可下載 PDF 永久保存</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>含本週立即可執行的改善建議</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-amber-800 text-xs font-medium">
                💡 $999 可全額折抵社群經營方案第一個月費用
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 transition-colors"
                />
                <p className="mt-1 text-xs text-gray-400">
                  付款成功後，健診連結將寄送至此 Email
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 transition-colors"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm font-medium">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all text-base"
              >
                {submitting ? "前往付款中..." : "前往付款 NT$ 999"}
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
              付款後多久收到健診連結？
            </summary>
            <p className="mt-2 pl-1">付款成功後系統會立即寄送連結到你的 Email，通常 1-3 分鐘內收到。</p>
          </details>
          <details className="group">
            <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
              健診連結有效期多久？
            </summary>
            <p className="mt-2 pl-1">連結有效期 30 天，為一次性使用，請找個安靜的時間一次填寫完畢（約 8-10 分鐘）。</p>
          </details>
          <details className="group">
            <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
              報告可以看多久？
            </summary>
            <p className="mt-2 pl-1">報告永久有效，你也可以列印或儲存 PDF 留存。</p>
          </details>
        </div>
      </div>
    </div>
  );
}
