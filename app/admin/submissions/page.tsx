"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type TabType = "brand" | "gmb";

interface Submission {
  id: string;
  createdAt: string;
  brandName: string | null;
  industry: string | null;
  contactName: string | null;
  contactInfo: string | null;
  teamSize: string | null;
  revenueRange: string | null;
  status: string;
  assignedTo: string | null;
  analysis: { overall_score?: number } | null;
}

interface GmbLead {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string | null;
  source: string;
  agentDelivered: boolean;
  note: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "待分析", color: "bg-yellow-100 text-yellow-700" },
  analyzed: { label: "已分析", color: "bg-green-100 text-green-700" },
  contacted: { label: "已聯繫", color: "bg-blue-100 text-blue-700" },
  converted: { label: "已轉化", color: "bg-purple-100 text-purple-700" },
};

export default function AdminSubmissionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("brand");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [gmbLeads, setGmbLeads] = useState<GmbLead[]>([]);
  const [gmbTotal, setGmbTotal] = useState(0);
  const [gmbLoading, setGmbLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 20, total: 0, totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (industryFilter) params.set("industry", industryFilter);

    try {
      const res = await fetch(`/api/admin/submissions?${params}`);
      if (res.status === 401) return;
      const data = await res.json();
      setSubmissions(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, industryFilter]);

  const fetchGmbLeads = useCallback(async () => {
    setGmbLoading(true);
    try {
      const res = await fetch("/api/admin/trial-leads?source=gmb-diagnostic");
      if (res.status === 401) return;
      const data = await res.json();
      setGmbLeads(data.leads || []);
      setGmbTotal(data.total || 0);
    } catch (err) {
      console.error("Fetch GMB leads error:", err);
    } finally {
      setGmbLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "brand") {
      fetchData();
    } else {
      fetchGmbLeads();
    }
  }, [fetchData, fetchGmbLeads, activeTab]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`確定要刪除「${name}」的問卷資料嗎？此操作無法復原。`)) return;

    try {
      const res = await fetch(`/api/admin/submissions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
        setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
      } else {
        const data = await res.json();
        alert(data.error || "刪除失敗");
      }
    } catch {
      alert("刪除失敗");
    }
  };

  const handleConvert = async (submissionId: string, brandName: string) => {
    if (!confirm(`確定要將「${brandName}」轉為客戶嗎？`)) return;

    try {
      const res = await fetch("/api/admin/clients/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });
      const data = await res.json();

      if (res.status === 409) {
        // 已經轉過，跳轉到該客戶
        if (data.clientId) {
          router.push(`/admin/clients/${data.clientId}`);
        } else {
          alert(data.error || "此問卷已轉為客戶");
        }
        return;
      }

      if (res.ok) {
        // 更新本地狀態
        setSubmissions((prev) =>
          prev.map((s) => s.id === submissionId ? { ...s, status: "converted" } : s)
        );
        router.push(`/admin/clients/${data.id}`);
      } else {
        alert(data.error || "轉換失敗");
      }
    } catch {
      alert("轉換失敗");
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/export", { method: "POST" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `questionnaire_export_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert("匯出失敗");
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">問卷提交列表</h1>
          <p className="text-sm text-gray-500 mt-1">
            共 {activeTab === "brand" ? pagination.total : gmbTotal} 筆提交
          </p>
        </div>
        {activeTab === "brand" && (
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {exporting ? "匯出中..." : "📥 匯出 CSV"}
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab("brand")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "brand"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          🏢 品牌健檢（{pagination.total}）
        </button>
        <button
          onClick={() => setActiveTab("gmb")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "gmb"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          📍 商家檢測（{gmbTotal}）
        </button>
      </div>

      {/* Filters - only show for brand tab */}
      {activeTab === "brand" && (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="搜尋品牌名稱..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchData()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部狀態</option>
            <option value="pending">待分析</option>
            <option value="analyzed">已分析</option>
            <option value="contacted">已聯繫</option>
            <option value="converted">已轉化</option>
          </select>
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部產業</option>
            <option value="旅遊活動">旅遊活動</option>
            <option value="電商零售">電商零售</option>
            <option value="餐飲美食">餐飲美食</option>
            <option value="教育課程">教育課程</option>
            <option value="美容保養">美容保養</option>
            <option value="健康醫療">健康醫療</option>
            <option value="科技軟體">科技軟體</option>
          </select>
          <button
            onClick={() => fetchData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            搜尋
          </button>
        </div>
      </div>
      )}

      {/* GMB Table */}
      {activeTab === "gmb" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {gmbLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : gmbLeads.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-4xl mb-3">📭</div>
              <p>還沒有商家檢測紀錄</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">時間</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">商家名稱</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">電話</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">備註</th>
                  </tr>
                </thead>
                <tbody>
                  {gmbLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{lead.name}</td>
                      <td className="px-4 py-3 text-gray-600">{lead.email}</td>
                      <td className="px-4 py-3 text-gray-600">{lead.phone || "—"}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{lead.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Brand Table */}
      {activeTab === "brand" && (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3">📭</div>
            <p>還沒有問卷提交紀錄</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">時間</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">品牌名稱</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">產業</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">聯絡人</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">分數</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">狀態</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => {
                  const status = statusMap[s.status] || {
                    label: s.status,
                    color: "bg-gray-100 text-gray-700",
                  };
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatDate(s.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {s.brandName || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{s.industry || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900">{s.contactName || "—"}</div>
                        <div className="text-xs text-gray-400">{s.contactInfo || ""}</div>
                      </td>
                      <td className="px-4 py-3">
                        {s.analysis?.overall_score != null ? (
                          <span className="font-bold text-blue-600">
                            {s.analysis.overall_score}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/submissions/${s.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            查看
                          </Link>
                          {s.status !== "converted" && (
                            <button
                              onClick={() => handleConvert(s.id, s.brandName || "此筆")}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              轉為客戶
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(s.id, s.brandName || "此筆")}
                            className="text-red-400 hover:text-red-600 text-sm"
                          >
                            刪除
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              第 {pagination.page} / {pagination.totalPages} 頁
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchData(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-30"
              >
                上一頁
              </button>
              <button
                onClick={() => fetchData(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-30"
              >
                下一頁
              </button>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
