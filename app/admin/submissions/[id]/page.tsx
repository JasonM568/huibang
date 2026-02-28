"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Submission {
  id: string;
  createdAt: string;
  brandName: string | null;
  industry: string | null;
  contactName: string | null;
  contactInfo: string | null;
  teamSize: string | null;
  revenueRange: string | null;
  website: string | null;
  socialMedia: string | null;
  foundedYear: string | null;
  mainProducts: string | null;
  status: string;
  assignedTo: string | null;
  answers: Record<string, string | string[]>;
  analysis: {
    overall_score: number;
    dimensions: Record<string, { score: number; label: string; comment: string }>;
    summary: string;
    top_recommendations: string[];
  } | null;
}

const answerLabels: Record<string, string> = {
  a1: "品牌/公司名稱",
  a2: "所屬產業",
  a3: "成立時間",
  a4: "主要產品/服務",
  a5: "官方網站",
  a6: "社群平台",
  a7: "團隊規模",
  a8: "月營收範圍",
  a9: "廣告投放狀態",
  a10: "使用廣告平台",
  a11: "每月廣告預算",
  a12: "行銷困擾",
  a13: "核心優勢",
  a14: "目標客群",
  a15: "競爭對手",
  a16: "客戶選擇原因",
  a17: "行銷目標",
  a18: "感興趣服務",
  a19: "預算範圍",
  a20: "補充說明",
  a21: "聯絡人姓名",
  a22: "聯絡方式",
  a23: "Email",
};

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-500";
}

function getScoreBg(score: number) {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-red-500";
}

export default function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState("");
  const [saving, setSaving] = useState(false);
  const [internalNote, setInternalNote] = useState("");

  useEffect(() => {
    params.then(({ id }) => {
      setId(id);
      fetch(`/api/admin/submissions/${id}`)
        .then((res) => {
          if (res.status === 401) {
            router.push("/admin/login");
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (data) {
            setSubmission(data);
            setInternalNote(data.internalNote || "");
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    });
  }, [params, router]);

  const updateStatus = async (newStatus: string) => {
    if (!submission) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/submissions/${submission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setSubmission({ ...submission, status: newStatus });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const saveNote = async () => {
    if (!submission) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/submissions/${submission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internalNote }),
      });
      alert("備註已儲存");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">找不到此筆資料</p>
        <Link href="/admin/submissions" className="text-blue-600 hover:underline mt-2 inline-block">
          ← 返回列表
        </Link>
      </div>
    );
  }

  const analysis = submission.analysis;

  return (
    <div className="max-w-4xl">
      {/* Back + header */}
      <div className="mb-6">
        <Link
          href="/admin/submissions"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← 返回列表
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {submission.brandName || "未提供品牌名"}
          </h1>
          <select
            value={submission.status}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={saving}
            className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${
              submission.status === "analyzed"
                ? "bg-green-100 text-green-700"
                : submission.status === "contacted"
                ? "bg-blue-100 text-blue-700"
                : submission.status === "converted"
                ? "bg-purple-100 text-purple-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            <option value="pending">待分析</option>
            <option value="analyzed">已分析</option>
            <option value="contacted">已聯繫</option>
            <option value="converted">已成交</option>
          </select>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          提交於{" "}
          {new Date(submission.createdAt).toLocaleString("zh-TW")} · ID: {id}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Quick info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">基本資訊</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">產業</span>
              <p className="font-medium text-gray-900">{submission.industry || "—"}</p>
            </div>
            <div>
              <span className="text-gray-400">成立時間</span>
              <p className="font-medium text-gray-900">{submission.foundedYear || "—"}</p>
            </div>
            <div>
              <span className="text-gray-400">團隊規模</span>
              <p className="font-medium text-gray-900">{submission.teamSize || "—"}</p>
            </div>
            <div>
              <span className="text-gray-400">月營收</span>
              <p className="font-medium text-gray-900">{submission.revenueRange || "—"}</p>
            </div>
            <div>
              <span className="text-gray-400">聯絡人</span>
              <p className="font-medium text-gray-900">{submission.contactName || "—"}</p>
            </div>
            <div>
              <span className="text-gray-400">聯絡方式</span>
              <p className="font-medium text-gray-900">{submission.contactInfo || "—"}</p>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        {analysis && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">AI 分析結果</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">總分</span>
                <span className={`text-2xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                  {analysis.overall_score}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
              {analysis.summary}
            </p>

            <div className="space-y-3 mb-4">
              {Object.entries(analysis.dimensions).map(([key, dim]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-28 shrink-0">{dim.label}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getScoreBg(dim.score)}`}
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                  <span className={`text-sm font-bold w-8 text-right ${getScoreColor(dim.score)}`}>
                    {dim.score}
                  </span>
                </div>
              ))}
            </div>

            {analysis.top_recommendations?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">建議</h3>
                <div className="space-y-2">
                  {analysis.top_recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <span className="text-blue-500 shrink-0">{i + 1}.</span>
                      <p className="text-gray-600">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link
                href={`/result/${id}`}
                target="_blank"
                className="text-sm text-blue-600 hover:underline"
              >
                查看客戶端報告頁 ↗
              </Link>
            </div>
          </div>
        )}

        {/* Full answers */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">完整問卷回答</h2>
          <div className="divide-y divide-gray-100">
            {Object.entries(submission.answers || {}).map(([key, value]) => {
              const displayValue = Array.isArray(value) ? value.join("、") : String(value || "");
              if (!displayValue) return null;
              return (
                <div key={key} className="py-3 flex gap-4">
                  <span className="text-sm text-gray-400 w-32 shrink-0">
                    {answerLabels[key] || key}
                  </span>
                  <p className="text-sm text-gray-900">{displayValue}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Internal Notes */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">內部備註</h2>
          <textarea
            value={internalNote}
            onChange={(e) => setInternalNote(e.target.value)}
            placeholder="輸入內部備註，例如跟進記錄、客戶回饋..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={saveNote}
            disabled={saving}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "儲存中..." : "儲存備註"}
          </button>
        </div>
      </div>
    </div>
  );
}
