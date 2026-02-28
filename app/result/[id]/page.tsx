import Link from "next/link";
import ResultContent from "@/components/questionnaire/ResultContent";

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

  let result = null;
  let error = null;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

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
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
            惠邦行銷
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            回首頁
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {error ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{error}</h1>
            <p className="text-gray-500 mb-8">請確認連結是否正確，或重新填寫問卷</p>
            <Link href="/questionnaire" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              重新填寫問卷
            </Link>
          </div>
        ) : result?.status === "pending" ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 animate-pulse">🔍</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">AI 正在分析你的品牌...</h1>
            <p className="text-gray-500 mb-4">這通常需要 30 秒到 1 分鐘，請稍候</p>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
            <p className="text-sm text-gray-400 mt-8">提交編號：{id}</p>
            <meta httpEquiv="refresh" content="5" />
          </div>
        ) : result?.analysis ? (
          <ResultContent result={result} id={id} />
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">問卷已收到！</h1>
            <p className="text-gray-500 mb-2">感謝你的填寫，我們的團隊將盡快為你分析</p>
            <p className="text-sm text-gray-400 mb-8">提交編號：{id}</p>
            <Link href="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              回到首頁
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
