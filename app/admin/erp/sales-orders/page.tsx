"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";

interface OrderItem {
  id: string;
  sku: string;
  productName: string;
  unit: string;
  quantity: number;
  shippedQuantity: number;
  unitPrice: string;
  priceTier: string | null;
  batchNo: string | null;
  batchExpiry: string | null;
}

interface SalesOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: string;
  totalAmount: string;
  customerName: string | null;
  customerType: string | null;
  warehouseName: string | null;
  items: OrderItem[];
}

const statusMeta: Record<string, { label: string; badge: string }> = {
  draft: { label: "草稿", badge: "bg-gray-100 text-gray-600" },
  confirmed: { label: "已確認", badge: "bg-blue-50 text-blue-700" },
  processing: { label: "處理中", badge: "bg-amber-50 text-amber-700" },
  shipped: { label: "已出貨", badge: "bg-indigo-50 text-indigo-700" },
  completed: { label: "已完成", badge: "bg-green-50 text-green-700" },
  cancelled: { label: "已取消", badge: "bg-red-50 text-red-600" },
};

const tierLabel: Record<string, string> = {
  wholesale: "批發價",
  group: "團購價",
  retail: "零售價",
  custom: "自訂",
};

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const fetchOrders = async (status?: string) => {
    setLoading(true);
    const qs = status ? `?status=${status}` : "";
    const res = await fetch(`/api/admin/erp/sales-orders${qs}`);
    const data = await res.json();
    setOrders(data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders(statusFilter);
  }, [statusFilter]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCancel = async (id: string, num: string) => {
    if (!confirm(`確定要取消 ${num}？`)) return;
    const res = await fetch(`/api/admin/erp/sales-orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "取消失敗");
      return;
    }
    fetchOrders(statusFilter);
  };

  const handleDelete = async (id: string, num: string) => {
    if (!confirm(`確定要刪除 ${num}？此動作無法復原。`)) return;
    const res = await fetch(`/api/admin/erp/sales-orders/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "刪除失敗");
      return;
    }
    fetchOrders(statusFilter);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">銷售訂單</h1>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部狀態</option>
            {Object.entries(statusMeta).map(([key, m]) => (
              <option key={key} value={key}>{m.label}</option>
            ))}
          </select>
          <Link
            href="/admin/erp/sales-orders/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + 新增訂單
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">載入中...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          {statusFilter ? "此狀態下無訂單" : "尚無訂單，點右上「新增訂單」開始"}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-2 py-3 w-10" />
                <th className="px-4 py-3 font-medium">單號</th>
                <th className="px-4 py-3 font-medium">日期</th>
                <th className="px-4 py-3 font-medium">客戶</th>
                <th className="px-4 py-3 font-medium">出貨倉</th>
                <th className="px-4 py-3 font-medium text-right">金額</th>
                <th className="px-4 py-3 font-medium">狀態</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const isOpen = expanded.has(o.id);
                const meta = statusMeta[o.status] || { label: o.status, badge: "bg-gray-100 text-gray-600" };
                return (
                  <Fragment key={o.id}>
                    <tr className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-2 py-3 text-center">
                        <button
                          onClick={() => toggleExpand(o.id)}
                          disabled={o.items.length === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          title={o.items.length === 0 ? "無品項" : "展開 / 收起"}
                        >
                          {isOpen ? "▾" : "▸"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/erp/sales-orders/${o.id}`}
                          className="font-mono text-blue-600 hover:underline"
                        >
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{o.orderDate}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{o.customerName || "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{o.warehouseName || "-"}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">
                        ${Number(o.totalAmount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${meta.badge}`}>{meta.label}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {!["cancelled", "shipped", "completed"].includes(o.status) && (
                          <button
                            onClick={() => handleCancel(o.id, o.orderNumber)}
                            className="text-gray-500 hover:text-gray-700 mr-3"
                          >
                            取消
                          </button>
                        )}
                        {["draft", "confirmed", "cancelled"].includes(o.status) && (
                          <button
                            onClick={() => handleDelete(o.id, o.orderNumber)}
                            className="text-red-500 hover:text-red-700"
                          >
                            刪除
                          </button>
                        )}
                      </td>
                    </tr>
                    {isOpen && o.items.length > 0 && (
                      <tr className="bg-gray-50/60">
                        <td className="px-2 py-2" />
                        <td colSpan={7} className="px-4 py-3">
                          <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-gray-100 text-left text-gray-500">
                                  <th className="px-3 py-2 font-medium w-24">品號</th>
                                  <th className="px-3 py-2 font-medium">品名</th>
                                  <th className="px-3 py-2 font-medium w-36">批號</th>
                                  <th className="px-3 py-2 font-medium w-28 text-right">單價</th>
                                  <th className="px-3 py-2 font-medium w-24 text-right">數量</th>
                                  <th className="px-3 py-2 font-medium w-24 text-right">已出</th>
                                </tr>
                              </thead>
                              <tbody>
                                {o.items.map((it) => (
                                  <tr key={it.id} className="border-b border-gray-50 last:border-0">
                                    <td className="px-3 py-2 font-mono text-gray-600">{it.sku}</td>
                                    <td className="px-3 py-2">{it.productName}</td>
                                    <td className="px-3 py-2">
                                      {it.batchNo ? (
                                        <span className="font-mono text-gray-600">{it.batchNo}</span>
                                      ) : (
                                        <span className="text-gray-400">—</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-right tabular-nums">
                                      {Number(it.unitPrice).toLocaleString()}
                                      {it.priceTier && (
                                        <span className="ml-1 text-[10px] text-gray-400">
                                          {tierLabel[it.priceTier] || it.priceTier}
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-right tabular-nums">
                                      {it.quantity} {it.unit}
                                    </td>
                                    <td className="px-3 py-2 text-right tabular-nums text-gray-500">
                                      {it.shippedQuantity > 0 ? `${it.shippedQuantity} ${it.unit}` : "—"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
