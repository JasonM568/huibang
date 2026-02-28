import QuestionnaireForm from "@/components/questionnaire/QuestionnaireForm";
import Link from "next/link";

export const metadata = {
  title: "免費品牌健檢 | 惠邦行銷",
  description:
    "花 5 分鐘完成品牌健檢問卷，AI 將為你的品牌提供專業的行銷分析與建議。",
};

export default function QuestionnairePage() {
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

      {/* Hero */}
      <section className="pt-12 pb-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            免費 · 約 5 分鐘
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            品牌健檢問卷
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            回答幾個問題，AI 將為你的品牌生成一份
            <br className="hidden sm:block" />
            <span className="text-blue-600 font-medium">
              專屬的行銷健檢報告
            </span>
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="text-green-500">✓</span> 品牌現況分析
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-green-500">✓</span> 行銷策略建議
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-green-500">✓</span> 優先改善方向
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="pb-20 px-4">
        <QuestionnaireForm />
      </section>
    </div>
  );
}
