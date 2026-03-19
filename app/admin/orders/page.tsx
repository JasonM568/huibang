"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Order {
  id: string;
  orderNo: string;
  productType: string;
  planId: string | null;
  amount: number;
  itemName: string | null;
  customerEmail: string;
  customerName: string | null;
  customerPhone: string | null;
  carrierNum: string | null;
  paymentStatus: string;
  invoiceStatus: string;
  invoiceNo: string | null;
  invoiceError: string | null;
  ecpayTradeNo: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const paymentStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "待付款", color: "bg-yellow-100 text-yellow-700" },
  paid: { label: "已付款", color: "bg-green-100 text-green-700" },
  failed: { label: "付款失敗", color: "bg-red-100 text-red-700" },
  cancelled: { label: "已取消", color: "bg-gray-100 text-gray-500" },
};

const invoiceStatusMap: Record<string, { label: string; color: string }> = {
  none: { label: "未開立", color: "bg-gray-100 text-gray-500" },
  pending: { label: "開立中", color: "bg-yellow-100 text-yellow-700" },
  issued: { label: "已開立", color: "bg-green-100 text-green-700" },
  failed: { label: "開立失敗", color: "bg-red-100 text-red-700" },
};

const productTypeMap: Record<string, string> = {
  diagnostic: "深度健診",
  "ai-pack": "AI 個體包",
};

const planNameMap: Record<string, string> = {
  "1": "入門",
  "2": "進階",
  "3": "全配",
};

export default function AdminOrdersPage() {
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 20, total: 0, totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [exporting, setExporting] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editForm, setEditForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    amount: 0,
    note: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (paymentFilter) params.set("paymentStatus", paymentFilter);
    if (invoiceFilter) params.set("invoiceStatus", invoiceFilter);
    if (productFilter) params.set("productType", productFilter);

    try {
      const res = await fetch(`/api/admin/orders?${params}`);
      if (res.status === 401) return;
      const data = await res.json();
      setOrderList(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [search, paymentFilter, invoiceFilter, productFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openEdit = (order: Order) => {
    setEditOrder(order);
    setEditForm({
      customerName: order.customerName || "",
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone || "",
      amount: order.amount,
      note: "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editOrder) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${editOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditOrder(null);
        fetchData(pagination.page);
      } else {
        const data = await res.json();
        alert(data.error || "更新失敗");
      }
    } catch {
      alert("操作失敗");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelOrder = async (order: Order) => {
    if (!confirm(`確定要取消訂單 ${order.orderNo} 嗎？此操作無法復原。`)) return;
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: "cancelled" }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchData(pagination.page);
      } else {
        alert(data.error || "取消失敗");
      }
    } catch {
      alert("操作失敗");
    }
  };

  const handleDeleteOrder = async (order: Order) => {
    if (!confirm(`確定要刪除訂單 ${order.orderNo} 嗎？\n\n此操作無法復原，訂單資料將永久移除。`)) return;
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData(pagination.page);
      } else {
        const data = await res.json();
        alert(data.error || "刪除失敗");
      }
    } catch {
      alert("操作失敗");
    }
  };

  const handleRetryInvoice = async (orderId: string) => {
    if (!confirm("確定要重新開立發票嗎？")) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert(`發票開立成功：${data.invoiceNo}`);
        fetchData(pagination.page);
      } else {
        alert(`發票開立失敗：${data.error}`);
        fetchData(pagination.page);
      }
    } catch {
      alert("操作失敗");
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Fetch all orders for CSV
      const params = new URLSearchParams({ page: "1", limit: "9999" });
      if (paymentFilter) params.set("paymentStatus", paymentFilter);
      if (invoiceFilter) params.set("invoiceStatus", invoiceFilter);
      if (productFilter) params.set("productType", productFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/orders?${params}`);
      const { data } = await res.json();

      // Build CSV
      const headers = ["訂單編號", "日期", "客戶姓名", "Email", "電話", "產品", "方案", "金額", "付款狀態", "發票狀態", "發票號碼", "載具", "ECPay交易號"];
      const rows = (data as Order[]).map((o) => [
        o.orderNo,
        new Date(o.createdAt).toLocaleString("zh-TW"),
        o.customerName || "",
        o.customerEmail,
        o.customerPhone || "",
        productTypeMap[o.productType] || o.productType,
        o.planId ? planNameMap[o.planId] || o.planId : "",
        o.amount,
        paymentStatusMap[o.paymentStatus]?.label || o.paymentStatus,
        invoiceStatusMap[o.invoiceStatus]?.label || o.invoiceStatus,
        o.invoiceNo || "",
        o.carrierNum || "",
        o.ecpayTradeNo || "",
      ]);

      const csv = "\uFEFF" + [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders_export_${new Date().toISOString().slice(0, 10)}.csv`;
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
          <h1 className="text-2xl font-bold text-gray-900">訂單管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            共 {pagination.total} 筆訂單
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {exporting ? "匯出中..." : "📥 匯出 CSV"}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="搜尋訂單編號、Email、姓名..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchData()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">付款狀態</option>
            <option value="pending">待付款</option>
            <option value="paid">已付款</option>
            <option value="failed">付款失敗</option>
          </select>
          <select
            value={invoiceFilter}
            onChange={(e) => setInvoiceFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">發票狀態</option>
            <option value="none">未開立</option>
            <option value="issued">已開立</option>
            <option value="failed">開立失敗</option>
          </select>
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部產品</option>
            <option value="ai-pack">AI 個體包</option>
            <option value="diagnostic">深度健診</option>
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
        ) : orderList.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3">📦</div>
            <p>還沒有訂單紀錄</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">訂單編號</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">客戶</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">產品</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">金額</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">付款</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">發票</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">日期</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {orderList.map((o) => {
                  const ps = paymentStatusMap[o.paymentStatus] || { label: o.paymentStatus, color: "bg-gray-100 text-gray-700" };
                  const is = invoiceStatusMap[o.invoiceStatus] || { label: o.invoiceStatus, color: "bg-gray-100 text-gray-700" };
                  return (
                    <tr
                      key={o.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {o.orderNo}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900">{o.customerName || "—"}</div>
                        <div className="text-xs text-gray-400">{o.customerEmail}</div>
                        {o.customerPhone && (
                          <div className="text-xs text-gray-400">{o.customerPhone}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-gray-900">{productTypeMap[o.productType] || o.productType}</div>
                        {o.planId && (
                          <div className="text-xs text-gray-400">{planNameMap[o.planId] || o.planId}方案</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900 whitespace-nowrap">
                        NT$ {o.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ps.color}`}>
                          {ps.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${is.color}`}>
                          {is.label}
                        </span>
                        {o.invoiceNo && (
                          <div className="text-xs text-gray-400 mt-0.5">{o.invoiceNo}</div>
                        )}
                        {o.invoiceStatus === "failed" && o.invoiceError && (
                          <div className="text-xs text-red-400 mt-0.5 max-w-[120px] truncate" title={o.invoiceError}>
                            {o.invoiceError}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatDate(o.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(o)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap"
                          >
                            編輯
                          </button>
                          {o.paymentStatus === "pending" && (
                            <button
                              onClick={() => handleCancelOrder(o)}
                              className="text-red-500 hover:text-red-700 text-sm font-medium whitespace-nowrap"
                            >
                              取消
                            </button>
                          )}
                          {o.paymentStatus === "paid" && (o.invoiceStatus === "failed" || o.invoiceStatus === "none") && (
                            <button
                              onClick={() => handleRetryInvoice(o.id)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium whitespace-nowrap"
                            >
                              開立發票
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteOrder(o)}
                            className="text-gray-400 hover:text-red-600 text-sm font-medium whitespace-nowrap transition-colors"
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
      {/* Edit Modal */}
      {editOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                編輯訂單
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">{editOrder.orderNo}</p>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">客戶姓名</label>
                <input
                  type="text"
                  value={editForm.customerName}
                  onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.customerEmail}
                  onChange={(e) => setEditForm({ ...editForm, customerEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">電話</label>
                <input
                  type="tel"
                  value={editForm.customerPhone}
                  onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">金額 (NT$)</label>
                <input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
                <textarea
                  value={editForm.note}
                  onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="管理員備註..."
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setEditOrder(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? "儲存中..." : "儲存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
