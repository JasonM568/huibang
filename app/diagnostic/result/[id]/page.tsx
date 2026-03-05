import Link from "next/link";
import DiagnosticResultContent from "@/components/questionnaire/DiagnosticResultContent";

export const metadata = {
  title: "社群帳號深度健診報告 | 惠邦行銷",
  description: "你的專屬社群帳號健診分析報告",
};

export default async function DiagnosticResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  let result = null;
  let error = null;

  try {
    const res = await fetch(`${baseUrl}/api/diagnostic/${id}`, { cache: "no-store" });
    if (res.ok) result = await res.json();
    else error = "找不到此份報告";
  } catch {
    error = "載入報告時發生錯誤";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-gray-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
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
            <p className="text-gray-500 mb-8">請確認連結是否正確，或聯繫我們</p>
            <Link href="/contact" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              聯繫惠邦行銷
            </Link>
          </div>
        ) : result?.status === "pending" ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 animate-pulse">🔍</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">AI 正在深度分析你的社群帳號...</h1>
            <p className="text-gray-500 mb-4">通常需要 30~60 秒，請稍候</p>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
            <p className="text-sm text-gray-400 mt-8">報告編號：{id}</p>
            <meta httpEquiv="refresh" content="5" />
          </div>
        ) : result?.analysis ? (
          <DiagnosticResultContent result={result} id={id} />
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">問卷已收到！</h1>
            <p className="text-gray-500 mb-8">AI 正在分析，報告完成後會寄送到你的信箱</p>
          </div>
        )}
      </main>
    </div>
  );
}
