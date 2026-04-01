"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Quote {
  id: string;
  quoteNumber: string;
  customerName: string | null;
  status: string;
  totalAmount: string;
  validUntil: string;
  createdAt: string;
}

const statusMap: Record<string, { label: string; color: string }> = {
  draft: { label: "草稿", color: "bg-gray-100 text-gray-700" },
  sent: { label: "已送出", color: "bg-blue-100 text-blue-700" },
  accepted: { label: "已接受", color: "bg-green-100 text-green-700" },
  rejected: { label: "已拒絕", color: "bg-red-100 text-red-700" },
  expired: { label: "已過期", color: "bg-yellow-100 text-yellow-700" },
};

export default function QuotesTab() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const fetchQuotes = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/quotes?${params}`);
    const data = await res.json();
    setQuotes(data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuotes();
  }, [search, status]);

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此報價單？")) return;
    await fetch(`/api/admin/quotes/${id}`, { method: "DELETE" });
    fetchQuotes();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="搜尋客戶名稱..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-60 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部狀態</option>
            <option value="draft">草稿</option>
            <option value="sent">已送出</option>
            <option value="accepted">已接受</option>
            <option value="rejected">已拒絕</option>
            <option value="expired">已過期</option>
          </select>
        </div>
        <Link
          href="/admin/quote-system/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + 新增報價單
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">載入中...</div>
      ) : quotes.length === 0 ? (
        <div className="text-center py-12 text-gray-400">尚無報價單</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">報價單號</th>
                <th className="px-4 py-3 font-medium">客戶</th>
                <th className="px-4 py-3 font-medium text-right">總金額</th>
                <th className="px-4 py-3 font-medium">狀態</th>
                <th className="px-4 py-3 font-medium">有效期限</th>
                <th className="px-4 py-3 font-medium">建立日期</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => {
                const s = statusMap[q.status] || statusMap.draft;
                return (
                  <tr key={q.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-900">{q.quoteNumber}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{q.customerName || "-"}</td>
                    <td className="px-4 py-3 text-gray-900 text-right">
                      ${Number(q.totalAmount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(q.validUntil).toLocaleDateString("zh-TW")}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(q.createdAt).toLocaleDateString("zh-TW")}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/quote-system/${q.id}`}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        查看
                      </Link>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        刪除
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
