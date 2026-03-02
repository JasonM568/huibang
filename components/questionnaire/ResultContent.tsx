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

      {/* Social Media Plan Promo */}
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6 border border-orange-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="flex gap-2">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow">F</span>
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold shadow">I</span>
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold shadow">T</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">🔥 社群經營方案</h3>
            <p className="text-sm text-gray-500">FB + IG + Threads 三平台同步經營，文案、圖片、短影音全包</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          根據你的品牌健檢結果，建議從社群經營著手，持續累積品牌聲量與客戶信任。我們提供三種方案，幫你的品牌每天都在線。
        </p>
        <Link
          href="/plans/social-media"
          className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300 hover:-translate-y-0.5"
        >
          查看社群經營方案 →
        </Link>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 sm:p-8 text-center text-white">
        <h3 className="text-xl font-bold mb-2">想要更深入的行銷策略規劃？</h3>
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
  );
}
