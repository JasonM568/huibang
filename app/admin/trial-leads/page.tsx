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
  note: string | null;
}

export default function TrialLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/trial-leads")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setLeads(data.leads);
          setTotal(data.total);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">試用名單</h1>
        <p className="text-sm text-gray-500 mt-1">社群文案機器人免費試用申請紀錄</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">申請名單</h2>
          <button
            onClick={() => {
              const csv = ["姓名,Email,手機,申請時間", ...leads.map((l) => `${l.name},${l.email},${l.phone || ""},${formatDate(l.createdAt)}`)].join("\n");
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
