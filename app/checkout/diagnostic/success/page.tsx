"use client";

import Link from "next/link";

export default function DiagnosticPaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          付款成功！
        </h1>

        <p className="text-gray-600 text-base leading-relaxed mb-8">
          你的 AI 社群帳號深度健診連結已寄送至你的 Email<br />
          請前往信箱查收（可能需要 1-3 分鐘）
        </p>

        {/* Steps */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 text-left mb-8">
          <h2 className="font-bold text-gray-900 mb-4">接下來的步驟</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">查收 Email</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  找到來自「惠邦行銷」的信件，主旨包含「AI 社群深度健診連結」
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">點擊連結填寫問卷</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  共 21 題，約 8-10 分鐘，請一次填完
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">立即查看 AI 報告</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  填完後 AI 即時產出你的專屬社群健診報告
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <p className="text-amber-800 text-sm">
            📧 沒收到信？請檢查垃圾郵件或促銷信件夾。如仍未收到，請聯繫{" "}
            <a
              href="mailto:chief@huibang.com.tw"
              className="underline font-medium"
            >
              chief@huibang.com.tw
            </a>
          </p>
        </div>

        {/* Back link */}
        <Link
          href="/"
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← 回到惠邦行銷官網
        </Link>
      </div>
    </div>
  );
}
