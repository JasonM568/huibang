"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function DiagnosticPaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tradeNo = searchParams.get("trade_no");

  const [status, setStatus] = useState<"checking" | "ready" | "timeout">("checking");
  const [dots, setDots] = useState("");

  // 動態載入點
  useEffect(() => {
    if (status !== "checking") return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, [status]);

  // 輪詢 check-order API
  const pollForToken = useCallback(async () => {
    if (!tradeNo) {
      setStatus("timeout");
      return;
    }

    let attempts = 0;
    const maxAttempts = 30; // 最多等 60 秒（每 2 秒一次）

    const poll = async () => {
      attempts++;
      try {
        const res = await fetch(`/api/ecpay/check-order?trade_no=${tradeNo}`);
        const data = await res.json();

        if (data.ready && data.token) {
          setStatus("ready");
          // 直接跳轉到問卷頁
          router.push(`/diagnostic?token=${data.token}`);
          return;
        }
      } catch {
        // 繼續重試
      }

      if (attempts >= maxAttempts) {
        setStatus("timeout");
        return;
      }

      // 2 秒後再查
      setTimeout(poll, 2000);
    };

    poll();
  }, [tradeNo, router]);

  useEffect(() => {
    pollForToken();
  }, [pollForToken]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        {/* Status: Checking */}
        {status === "checking" && (
          <>
            <div className="mx-auto w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <span className="text-3xl">🔬</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              付款成功！
            </h1>
            <p className="text-gray-600 text-base leading-relaxed mb-4">
              正在準備你的健診問卷{dots}
            </p>
            <div className="flex justify-center mb-8">
              <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full animate-[loading_2s_ease-in-out_infinite]" />
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              系統正在處理你的付款，馬上就好
            </p>
          </>
        )}

        {/* Status: Ready (brief moment before redirect) */}
        {status === "ready" && (
          <>
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              準備完成！
            </h1>
            <p className="text-gray-600">正在前往健診問卷...</p>
          </>
        )}

        {/* Status: Timeout */}
        {status === "timeout" && (
          <>
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              付款成功！
            </h1>
            <p className="text-gray-600 text-base leading-relaxed mb-8">
              你的健診連結已寄送至 Email<br />
              請前往信箱查收（1-3 分鐘內）
            </p>

            {/* Steps */}
            <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 text-left mb-8">
              <h2 className="font-bold text-gray-900 mb-4">接下來的步驟</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">查收 Email</p>
                    <p className="text-gray-500 text-xs mt-0.5">找到來自「惠邦行銷」的信件</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">點擊連結填寫問卷</p>
                    <p className="text-gray-500 text-xs mt-0.5">共 21 題，約 8-10 分鐘</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">立即查看 AI 報告</p>
                    <p className="text-gray-500 text-xs mt-0.5">填完後 AI 即時產出專屬報告</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
              <p className="text-amber-800 text-sm">
                📧 沒收到信？請檢查垃圾郵件夾。如仍未收到，請聯繫{" "}
                <a href="mailto:service@huibang.com.tw" className="underline font-medium">
                  service@huibang.com.tw
                </a>
              </p>
            </div>

            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              ← 回到惠邦行銷官網
            </Link>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 80%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
