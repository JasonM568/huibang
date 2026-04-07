"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Client {
  id: string;
  clientNumber: string | null;
  createdAt: string;
  brandName: string;
  industry: string | null;
  contactName: string | null;
  contactEmail: string | null;
  status: string;
  planTier: string | null;
  monthlyFee: number | null;
  assignedTo: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusMap: Record<string, { label: string; color: string }> = {
  prospect: { label: "洽談中", color: "bg-yellow-100 text-yellow-700" },
  active: { label: "合作中", color: "bg-green-100 text-green-700" },
  paused: { label: "暫停", color: "bg-gray-100 text-gray-700" },
  ended: { label: "已結束", color: "bg-red-100 text-red-700" },
};

const planMap: Record<string, string> = {
  basic: "基礎方案",
  growth: "品牌成長",
  flagship: "旗艦方案",
  custom: "客製方案",
};

export default function AdminClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 20, total: 0, totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // 新增客戶 modal
  const [showModal, setShowModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newTaxId, setNewTaxId] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);

    try {
      const res = await fetch(`/api/admin/clients?${params}`);
      if (res.status === 401) return;
      const data = await res.json();
      setClients(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`確定要刪除客戶「${name}」嗎？此操作無法復原。`)) return;

    try {
      const res = await fetch(`/api/admin/clients/${id}`, { method: "DELETE" });
      if (res.ok) {
        setClients((prev) => prev.filter((c) => c.id !== id));
        setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
      } else {
        const data = await res.json();
        alert(data.error || "刪除失敗");
      }
    } catch {
      alert("刪除失敗");
    }
  };

  const handleCreate = async () => {
    if (!newBrandName.trim() || !newEmail.trim() || !newPhone.trim() || !newTaxId.trim()) {
      alert("請填寫所有必填欄位");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: newBrandName.trim(),
          contactEmail: newEmail.trim(),
          contactPhone: newPhone.trim(),
          taxId: newTaxId.trim(),
        }),
      });
      if (res.ok) {
        const client = await res.json();
        setShowModal(false);
        setNewBrandName("");
        setNewEmail("");
        setNewPhone("");
        setNewTaxId("");
        router.push(`/admin/clients/${client.id}`);
      } else {
        const data = await res.json();
        alert(data.error || "建立失敗");
      }
    } catch {
      alert("建立失敗");
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">客戶管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            共 {pagination.total} 位客戶
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + 新增客戶
        </button>
      </div>

      {/* Filters */}
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
            <option value="prospect">洽談中</option>
            <option value="active">合作中</option>
            <option value="paused">暫停</option>
            <option value="ended">已結束</option>
          </select>
          <button
            onClick={() => fetchData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            搜尋
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3">🏢</div>
            <p>還沒有客戶資料</p>
            <p className="text-xs mt-1">可以手動新增或從問卷列表轉入</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">客戶編號</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">品牌名稱</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">產業</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">方案</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">月費</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">狀態</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">負責人</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">建立日期</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => {
                  const status = statusMap[c.status] || {
                    label: c.status,
                    color: "bg-gray-100 text-gray-700",
                  };
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs whitespace-nowrap">
                        {c.clientNumber || "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {c.brandName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{c.industry || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {c.planTier ? planMap[c.planTier] || c.planTier : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {c.monthlyFee ? `$${c.monthlyFee.toLocaleString()}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{c.assignedTo || "—"}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatDate(c.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/clients/${c.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            查看
                          </Link>
                          <button
                            onClick={() => handleDelete(c.id, c.brandName)}
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

      {/* 新增客戶 Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">新增客戶</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  品牌名稱 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="輸入品牌名稱"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="輸入 Email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  電話 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="輸入電話"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  統一編號 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTaxId}
                  onChange={(e) => setNewTaxId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="輸入統編"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowModal(false); setNewBrandName(""); setNewEmail(""); setNewPhone(""); setNewTaxId(""); }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                disabled={!newBrandName.trim() || !newEmail.trim() || !newPhone.trim() || !newTaxId.trim() || creating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? "建立中..." : "建立"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
