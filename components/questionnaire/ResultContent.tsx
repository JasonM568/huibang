"use client";

import Link from "next/link";

interface DimensionData {
  score: number;
  label: string;
  comment: string;
}

interface AnalysisData {
  overall_score: number;
  dimensions: {
    brand_clarity: DimensionData;
    target_audience: DimensionData;
    competitive_diff: DimensionData;
    marketing_health: DimensionData;
    growth_readiness: DimensionData;
  };
  summary: string;
  top_recommendations: string[];
}

interface ResultData {
  id: string;
  brandName: string;
  industry: string;
  createdAt: string;
  status: string;
  analysis: AnalysisData;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-500";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-red-500";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "優秀";
  if (score >= 60) return "良好";
  if (score >= 40) return "待加強";
  return "需改善";
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={score >= 80 ? "#22c55e" : score >= 60 ? "#3b82f6" : score >= 40 ? "#eab308" : "#ef4444"}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
        <span className="text-xs text-gray-400">/ 100</span>
      </div>
    </div>
  );
}

function DimensionCard({ data, icon }: { data: DimensionData; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h4 className="font-semibold text-gray-800">{data.label}</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${getScoreColor(data.score)}`}>
            {data.score}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full text-white ${getScoreBg(data.score)}`}>
            {getScoreLabel(data.score)}
          </span>
        </div>
      </div>
      {/* Score bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${getScoreBg(data.score)}`}
          style={{ width: `${data.score}%` }}
        />
      </div>
      <p className="text-sm text-gray-600">{data.comment}</p>
    </div>
  );
}

function SocialAuditPromo({ analysis }: { analysis: AnalysisData }) {
  const weakDimensions = Object.entries(analysis.dimensions)
    .filter(([, data]) => data.score < 60)
    .map(([, data]) => data.label);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-6 sm:p-8 mb-6 border border-indigo-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-100 to-transparent rounded-bl-full opacity-50" />

      <div className="relative">
        {/* Badge */}
        <div className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold mb-4">
          🎯 限填過問卷的你 — 專屬優惠
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          深度社群帳號分析健診
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          品牌健檢只是第一步。我們會實際分析你的 FB、IG、Threads 帳號，
          提供一份 5~15 頁的專業深度報告，找出你的社群真正的問題和機會。
        </p>

        {/* What you get */}
        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          {[
            { icon: "📊", text: "各平台帳號現況與互動率分析" },
            { icon: "📈", text: "內容表現分析（哪類貼文最有效）" },
            { icon: "🔍", text: "競品社群比較與差異化建議" },
            { icon: "🎯", text: "受眾輪廓分析 + 具體改善建議" },
          ].map((item) => (
            <div key={item.text} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="flex-shrink-0">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        {weakDimensions.length > 0 && (
          <p className="text-sm text-indigo-600 bg-indigo-50 rounded-lg px-4 py-2 mb-5">
            💡 你的健檢報告顯示「{weakDimensions.slice(0, 2).join("」和「")}」需要加強，
            深度健診能找出具體原因和解法。
          </p>
        )}

        {/* Pricing */}
        <div className="flex items-end gap-3 mb-2">
          <span className="text-sm text-gray-400 line-through">原價 NT$ 5,000</span>
          <span className="text-3xl font-black text-indigo-600">NT$ 2,500</span>
          <span className="text-sm text-gray-500">問卷專屬價</span>
        </div>
        <p className="text-xs text-green-600 font-medium mb-5">
          ✨ 若之後簽約社群經營方案，健診費用 $2,500 可全額折抵第一個月費用
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="https://p.ecpay.com.tw/120B010"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5"
          >
            立即購買深度健診 — NT$ 2,500 →
          </a>
          <Link
            href="/plans/social-audit"
            className="inline-flex items-center justify-center px-6 py-3 border border-indigo-200 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-all duration-300"
          >
            了解更多內容
          </Link>
        </div>
      </div>
    </div>
  );
}

function getWeakestDimension(dimensions: AnalysisData["dimensions"]) {
  const entries = Object.entries(dimensions) as [string, DimensionData][];
  return entries.reduce((weakest, current) =>
    current[1].score < weakest[1].score ? current : weakest
  );
}

function getRecommendedPlan(overallScore: number) {
  if (overallScore <= 40) {
    return {
      name: "基礎經營方案",
      price: "18,000",
      tag: "適合你的起步階段",
      color: "from-green-500 to-green-600",
      tagBg: "bg-green-100 text-green-700",
    };
  }
  if (overallScore <= 65) {
    return {
      name: "品牌成長方案",
      price: "32,000",
      tag: "最適合你的成長階段 ⭐",
      color: "from-orange-500 to-orange-600",
      tagBg: "bg-orange-100 text-orange-700",
    };
  }
  return {
    name: "全方位旗艦方案",
    price: "55,000",
    tag: "幫你的品牌全力衝刺",
    color: "from-purple-500 to-purple-600",
    tagBg: "bg-purple-100 text-purple-700",
  };
}

function getRecommendationReason(weakestKey: string, score: number) {
  const reasons: Record<string, { title: string; desc: string }> = {
    brand_clarity: {
      title: "建立品牌識別度",
      desc: "你的品牌定位還不夠清晰，透過持續的社群內容輸出，能幫助受眾更快認識你、記住你。",
    },
    target_audience: {
      title: "精準觸及目標客群",
      desc: "你對目標客群的認知還有提升空間，透過社群經營能持續測試內容方向，找到真正能引起共鳴的受眾。",
    },
    competitive_diff: {
      title: "建立競爭差異化",
      desc: "你的品牌需要跟競品拉開差距，透過有策略的社群內容，讓受眾感受到你的獨特價值。",
    },
    marketing_health: {
      title: "提升行銷體質",
      desc: "你的行銷投入還有很大的成長空間，從社群經營開始是最有效率的第一步，用內容持續累積品牌聲量。",
    },
    growth_readiness: {
      title: "為成長做好準備",
      desc: "你的品牌有成長的潛力，但需要更穩定的社群經營節奏，讓品牌在目標客群心中持續保持存在感。",
    },
  };
  return reasons[weakestKey] || reasons.marketing_health;
}

function PlanRecommendation({ analysis }: { analysis: AnalysisData }) {
  const [weakestKey, weakestData] = getWeakestDimension(analysis.dimensions);
  const plan = getRecommendedPlan(analysis.overall_score);
  const reason = getRecommendationReason(weakestKey, weakestData.score);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6 border border-orange-100 overflow-hidden relative">
      {/* Recommendation badge */}
      <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${plan.tagBg}`}>
        📊 根據你的分數（{analysis.overall_score} 分）推薦
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
        <div className="flex gap-2">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow">F</span>
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold shadow">I</span>
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold shadow">T</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            🔥 社群經營 — {plan.name}
          </h3>
          <p className="text-sm text-gray-500">
            FB + IG + Threads 三平台同步經營，文案、圖片設計全包
          </p>
        </div>
      </div>

      {/* Why this plan */}
      <div className="bg-orange-50 rounded-xl p-4 mb-4">
        <h4 className="text-sm font-bold text-orange-800 mb-1">
          💡 為什麼推薦你「{reason.title}」？
        </h4>
        <p className="text-sm text-orange-700 leading-relaxed">
          {reason.desc}
        </p>
      </div>

      {/* Plan highlight */}
      <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 mb-5">
        <div>
          <p className="text-sm text-gray-500">{plan.tag}</p>
          <p className="text-2xl font-black text-gray-900">
            NT$ {plan.price}
            <span className="text-sm font-normal text-gray-400"> / 月</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">你的品牌總分</p>
          <p className={`text-3xl font-black ${getScoreColor(analysis.overall_score)}`}>
            {analysis.overall_score}
          </p>
        </div>
      </div>

      <Link
        href="/plans/social-media"
        className={`inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r ${plan.color} text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}
      >
        查看完整方案內容 →
      </Link>
    </div>
  );
}

export default function ResultContent({ result, id }: { result: ResultData; id: string }) {
  const analysis = result.analysis;
  const dimensionIcons = {
    brand_clarity: "🎯",
    target_audience: "👥",
    competitive_diff: "⚡",
    marketing_health: "📊",
    growth_readiness: "🚀",
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-block px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
          分析完成
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">品牌健檢報告</h1>
        <p className="text-gray-500">
          {result.brandName || "你的品牌"}
          {result.industry ? ` · ${result.industry}` : ""}
        </p>
      </div>

      {/* Overall Score */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center">
        <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
          品牌健康總分
        </h3>
        <ScoreRing score={analysis.overall_score} size={140} />
        <p className="mt-4 text-gray-600 max-w-md mx-auto">{analysis.summary}</p>
      </div>

      {/* Dimensions */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">五大維度分析</h3>
        <div className="grid gap-4">
          {Object.entries(analysis.dimensions).map(([key, data]) => (
            <DimensionCard
              key={key}
              data={data}
              icon={dimensionIcons[key as keyof typeof dimensionIcons]}
            />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>💡</span> 優先改善建議
        </h3>
        <div className="space-y-3">
          {analysis.top_recommendations.map((rec, index) => (
            <div
              key={index}
              className="flex gap-3 p-4 bg-blue-50 rounded-xl"
            >
              <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <p className="text-gray-700 text-sm leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Social Audit Promo */}
      <SocialAuditPromo analysis={analysis} />

      {/* Step 2: Smart Plan Recommendation */}
      <PlanRecommendation analysis={analysis} />

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 sm:p-8 text-center text-white">
        <h3 className="text-xl font-bold mb-2">想要更深入的行銷策略規劃？</h3>
        <p className="text-blue-100 mb-6">
          我們的行銷顧問會在 2 個工作天內與你聯繫，提供更詳細的建議
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/plans/social-audit"
            className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            先做深度社群健診
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 border border-white/30 text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
          >
            直接預約諮詢
          </Link>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        報告編號：{id} · 生成於{" "}
        {new Date(result.createdAt).toLocaleDateString("zh-TW")}
      </p>
    </div>
  );
}
