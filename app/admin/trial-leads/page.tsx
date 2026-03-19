"use client";

import { useEffect, useState } from "react";

interface Lead {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string | null;
  source: string;
  agentDelivered: boolean;
  deliveredAt: string | null;
  note: string | null;
}

export default function TrialLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState<string | null>(null);

  const loadLeads = () => {
    fetch("/api/admin/trial-leads")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setLeads(data.leads);
          setTotal(data.total);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadLeads(); }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const handleResend = async (id: string) => {
    setResending(id);
    try {
      const res = await fetch("/api/admin/trial-leads/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        loadLeads();
      } else {
        alert("寄送失敗，請稍後再試");
      }
    } finally {
      setResending(null);
    }
  };

  const notDelivered = leads.filter((l) => !l.agentDelivered).length;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">試用名單</h1>
          <p className="text-sm text-gray-500 mt-1">社群文案機器人免費試用申請紀錄</p>
        </div>
        <a
          href="https://resend.com/emails"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          <span>📨</span> Resend 後台
        </a>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">總申請數</p>
          <p className="text-3xl font-bold text-gray-900">{total}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">本月新增</p>
          <p className="text-3xl font-bold text-emerald-600">
            {leads.filter((l) => {
              const d = new Date(l.createdAt);
              const now = new Date();
              return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
            }).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">留電話比率</p>
          <p className="text-3xl font-bold text-blue-600">
            {total > 0 ? Math.round((leads.filter((l) => l.phone).length / total) * 100) : 0}%
          </p>
        </div>
        <div className={`bg-white rounded-xl p-5 border shadow-sm ${notDelivered > 0 ? "border-red-200 bg-red-50" : "border-gray-100"}`}>
          <p className="text-xs text-gray-400 mb-1">未寄出</p>
          <p className={`text-3xl font-bold ${notDelivered > 0 ? "text-red-600" : "text-gray-300"}`}>{notDelivered}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">申請名單</h2>
          <button
            onClick={() => {
              const csv = ["姓名,Email,手機,申請時間,信件寄出時間", ...leads.map((l) => `${l.name},${l.email},${l.phone || ""},${formatDate(l.createdAt)},${l.deliveredAt ? formatDate(l.deliveredAt) : "未寄出"}`)].join("\n");
              const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `試用名單_${new Date().toISOString().split("T")[0]}.csv`;
              a.click();
            }}
            className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            匯出 CSV
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">載入中...</div>
        ) : leads.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">尚無試用申請</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">申請時間</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">姓名</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Email</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">手機</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">信件狀態</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{lead.name}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <a href={`mailto:${lead.email}`} className="hover:text-blue-600 transition-colors">
                        {lead.email}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {lead.phone ? (
                        <a href={`tel:${lead.phone}`} className="hover:text-blue-600 transition-colors">
                          {lead.phone}
                        </a>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {lead.agentDelivered ? (
                        <div>
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                            ✅ 已寄出
                          </span>
                          {lead.deliveredAt && (
                            <p className="text-xs text-gray-400 mt-0.5">{formatDate(lead.deliveredAt)}</p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
                          ❌ 未寄出
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleResend(lead.id)}
                        disabled={resending === lead.id}
                        className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium disabled:opacity-50"
                      >
                        {resending === lead.id ? "寄送中..." : "重新寄送"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
