"use client";

import { useState } from "react";
import Link from "next/link";
import type { DeepAnalysisResult } from "@/lib/analyze-deep";

interface DiagnosticResultContentProps {
  result: {
    id: string;
    contactName?: string;
    email?: string;
    analysis: DeepAnalysisResult;
    createdAt: string;
  };
  id: string;
}

const healthColors = {
  良好: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", dot: "bg-green-500" },
  尚可: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
  待改善: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  危險: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
};

export default function DiagnosticResultContent({ result, id }: DiagnosticResultContentProps) {
  const { analysis } = result;
  const colors = healthColors[analysis.health_level] || healthColors["待改善"];
  const [emailSent, setEmailSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSendEmail = async () => {
    if (!result.email) return;
    setSending(true);
    try {
      const res = await fetch("/api/diagnostic/resend-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: id }),
      });
      if (res.ok) setEmailSent(true);
    } catch {
      alert("寄信失敗，請稍後再試");
    } finally {
      setSending(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6 print:space-y-4">
      {/* ── 列印樣式 ── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      {/* ── 第一區塊：總分 ── */}
      <div className={`rounded-2xl p-8 border-2 ${colors.bg} ${colors.border} text-center`}>
        <p className="text-sm font-medium text-gray-500 mb-2">社群帳號健診總分</p>
        <div className={`text-7xl font-black mb-2 ${colors.text}`}>{analysis.overall_score}</div>
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 ${colors.text} font-bold text-lg`}>
          <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
          {analysis.health_level}
        </div>
        <p className="text-gray-600 mt-3 text-base">{analysis.health_summary}</p>
      </div>

      {/* ── 操作按鈕 ── */}
      <div className="flex flex-wrap gap-3 no-print">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:border-gray-300 transition-colors text-sm"
        >
          🖨️ 列印 / 儲存 PDF
        </button>
        {result.email && (
          <button
            onClick={handleSendEmail}
            disabled={sending || emailSent}
            className="flex items-center gap-2 px-5 py-2.5 border-2 border-indigo-200 text-indigo-600 font-semibold rounded-xl hover:border-indigo-400 transition-colors text-sm disabled:opacity-60"
          >
            {emailSent ? "✅ 已寄出" : sending ? "寄送中..." : "📧 寄到我的信箱"}
          </button>
        )}
      </div>

      {/* ── 第二區塊：第一印象診斷 ── */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>🪞</span> 第一印象診斷
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
            <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">✅ 你做對的事</p>
            <p className="text-gray-700 text-sm leading-relaxed">{analysis.first_impression.what_works}</p>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">⚠️ 陌生人看到的問題</p>
            <p className="text-gray-700 text-sm leading-relaxed">{analysis.first_impression.critical_gap}</p>
          </div>
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1">💡 帳號定位建議</p>
            <p className="text-gray-700 text-sm leading-relaxed">{analysis.first_impression.bio_diagnosis}</p>
          </div>
        </div>
      </div>

      {/* ── 第三區塊：內容策略診斷 ── */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>✍️</span> 內容策略診斷
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">目前內容模式</p>
            <p className="text-gray-700 text-sm leading-relaxed">{analysis.content_strategy.pattern_found}</p>
          </div>
          <hr className="border-gray-100" />
          <div>
            <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1">為什麼沒有轉換</p>
            <p className="text-gray-700 text-sm leading-relaxed">{analysis.content_strategy.conversion_gap}</p>
          </div>
          <hr className="border-gray-100" />
          <div>
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-wide mb-1">最缺少的要素</p>
            <p className="text-gray-700 text-sm leading-relaxed">{analysis.content_strategy.missing_element}</p>
          </div>
        </div>
      </div>

      {/* ── 第四區塊：數據盲點 ── */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>📊</span> 數據掌握度
          <span className={`ml-auto text-sm font-bold px-3 py-1 rounded-full ${
            analysis.data_blindspot.awareness_level === "清楚"
              ? "bg-green-100 text-green-700"
              : analysis.data_blindspot.awareness_level === "模糊"
              ? "bg-amber-100 text-amber-700"
              : "bg-red-100 text-red-700"
          }`}>
            {analysis.data_blindspot.awareness_level}
          </span>
        </h3>
        <div className="space-y-3">
          <p className="text-gray-700 text-sm leading-relaxed">{analysis.data_blindspot.risk_statement}</p>
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-xs font-bold text-blue-600 mb-1">你正在錯過的機會</p>
            <p className="text-gray-700 text-sm leading-relaxed">{analysis.data_blindspot.what_they_are_missing}</p>
          </div>
        </div>
      </div>

      {/* ── 第五區塊：優先改善清單 ── */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
          <span>🎯</span> 優先改善清單
        </h3>

        {/* 本週立即處理 */}
        {analysis.priority_actions.immediate.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <p className="text-sm font-bold text-red-600">本週立即處理（今天就能做）</p>
            </div>
            <div className="space-y-3">
              {analysis.priority_actions.immediate.map((action, i) => (
                <div key={i} className="p-4 bg-red-50 border border-red-100 rounded-xl">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="font-semibold text-gray-900 text-sm">{action.title}</p>
                    <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">⏱ {action.time_required}</span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{action.specific_action}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 本月建立機制 */}
        {analysis.priority_actions.this_month.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <p className="text-sm font-bold text-amber-600">本月建立機制</p>
            </div>
            <div className="space-y-3">
              {analysis.priority_actions.this_month.map((action, i) => (
                <div key={i} className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <p className="font-semibold text-gray-900 text-sm mb-1">{action.title}</p>
                  <p className="text-gray-600 text-sm mb-2">{action.why_important}</p>
                  <p className="text-indigo-600 text-xs font-medium">第一步：{action.first_step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 需要系統支援 */}
        {analysis.priority_actions.needs_system.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
              <p className="text-sm font-bold text-gray-500">需要系統支援才能真正解決</p>
            </div>
            <div className="space-y-3">
              {analysis.priority_actions.needs_system.map((action, i) => (
                <div key={i} className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="font-semibold text-gray-900 text-sm mb-1">{action.title}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{action.why_hard_alone}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 第六區塊：轉介（CTA） ── */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white text-center no-print">
        <p className="text-indigo-100 text-sm leading-relaxed mb-6 max-w-xl mx-auto">
          {analysis.transition_message}
        </p>
        <h3 className="text-xl font-bold mb-6">想讓專業團隊幫你系統性解決這些問題？</h3>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/plans/social-media"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors"
          >
            查看社群經營方案 →
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:border-white/60 transition-colors"
          >
            預約免費諮詢
          </Link>
        </div>
        <p className="text-indigo-200 text-xs mt-4">深度健診費用 $999 可全額折抵社群方案第一個月</p>
      </div>

      {/* 報告資訊 */}
      <p className="text-center text-xs text-gray-400 no-print">
        報告編號：{id} ｜ 由 AI 自動生成，僅供參考
      </p>
    </div>
  );
}
