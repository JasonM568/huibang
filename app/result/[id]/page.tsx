import Link from "next/link";

export const metadata = {
  title: "品牌健檢結果 | 惠邦行銷",
  description: "你的品牌健檢分析報告",
};

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch result from API
  let result = null;
  let error = null;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/questionnaire/${id}`, {
      cache: "no-store",
    });

    if (res.ok) {
      result = await res.json();
    } else {
      error = "找不到此份報告";
    }
  } catch {
    error = "載入報告時發生錯誤";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            惠邦行銷
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            回首頁
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {error ? (
          /* Error state */
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{error}</h1>
            <p className="text-gray-500 mb-8">請確認連結是否正確，或重新填寫問卷</p>
            <Link
              href="/questionnaire"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              重新填寫問卷
            </Link>
          </div>
        ) : result?.status === "pending" ? (
          /* Analyzing state */
          <div className="text-center py-20">
            <div className="text-6xl mb-4 animate-pulse">🔍</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              AI 正在分析你的品牌...
            </h1>
            <p className="text-gray-500 mb-4">
              這通常需要 30 秒到 1 分鐘，請稍候
            </p>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
            <p className="text-sm text-gray-400 mt-8">
              提交編號：{id}
            </p>
            {/* Auto refresh */}
            <meta httpEquiv="refresh" content="5" />
          </div>
        ) : result?.analysis ? (
          /* Result display */
          <div>
            <div className="text-center mb-10">
              <div className="text-5xl mb-4">📊</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                品牌健檢報告
              </h1>
              <p className="text-gray-500">
                {result.brandName || "你的品牌"} · {result.industry || ""}
              </p>
            </div>

            {/* Analysis content */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
              <div className="prose prose-blue max-w-none">
                {typeof result.analysis === "string" ? (
                  <div className="whitespace-pre-wrap">{result.analysis}</div>
                ) : (
                  <div>
                    {/* Structured analysis display */}
                    {result.analysis.summary && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          📋 總體評估
                        </h3>
                        <p className="text-gray-600">{result.analysis.summary}</p>
                      </div>
                    )}
                    {result.analysis.strengths && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-green-700 mb-2">
                          💪 品牌優勢
                        </h3>
                        <p className="text-gray-600">{result.analysis.strengths}</p>
                      </div>
                    )}
                    {result.analysis.weaknesses && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-orange-700 mb-2">
                          ⚠️ 待改善項目
                        </h3>
                        <p className="text-gray-600">{result.analysis.weaknesses}</p>
                      </div>
                    )}
                    {result.analysis.recommendations && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-blue-700 mb-2">
                          🎯 行銷建議
                        </h3>
                        <p className="text-gray-600">
                          {result.analysis.recommendations}
                        </p>
                      </div>
                    )}
                    {result.analysis.nextSteps && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-purple-700 mb-2">
                          🚀 建議下一步
                        </h3>
                        <p className="text-gray-600">{result.analysis.nextSteps}</p>
                      </div>
                    )}
                    {/* Fallback: render all keys */}
                    {!result.analysis.summary &&
                      !result.analysis.strengths && (
                        <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                          {JSON.stringify(result.analysis, null, 2)}
                        </pre>
                      )}
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 sm:p-8 text-center text-white">
              <h3 className="text-xl font-bold mb-2">
                想要更深入的行銷策略規劃？
              </h3>
              <p className="text-blue-100 mb-6">
                我們的行銷顧問會在 2 個工作天內與你聯繫，提供更詳細的建議
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/contact"
                  className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  立即預約諮詢
                </Link>
                <Link
                  href="/services"
                  className="px-6 py-3 border border-white/30 text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
                >
                  瞭解我們的服務
                </Link>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 mt-6">
              報告編號：{id} · 生成於{" "}
              {new Date(result.createdAt).toLocaleDateString("zh-TW")}
            </p>
          </div>
        ) : (
          /* Unknown state fallback */
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              問卷已收到！
            </h1>
            <p className="text-gray-500 mb-2">
              感謝你的填寫，我們的團隊將盡快為你分析
            </p>
            <p className="text-sm text-gray-400 mb-8">提交編號：{id}</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              回到首頁
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
