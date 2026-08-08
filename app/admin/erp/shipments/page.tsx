"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";

interface ShipmentItem {
  id: string;
  sku: string;
  productName: string;
  unit: string;
  shippedQuantity: number;
  batchNo: string | null;
  batchExpiry: string | null;
}

interface Shipment {
  id: string;
  shipmentNumber: string;
  shipDate: string;
  status: string;
  signedBy: string | null;
  orderNumber: string | null;
  customerName: string | null;
  warehouseName: string | null;
  items: ShipmentItem[];
}

const statusMeta: Record<string, { label: string; badge: string }> = {
  pending: { label: "待出貨", badge: "bg-gray-100 text-gray-600" },
  shipped: { label: "已出貨", badge: "bg-indigo-50 text-indigo-700" },
  signed: { label: "已簽收", badge: "bg-green-50 text-green-700" },
  cancelled: { label: "已取消", badge: "bg-red-50 text-red-600" },
};

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const fetchShipments = async (status?: string) => {
    setLoading(true);
    const qs = status ? `?status=${status}` : "";
    const res = await fetch(`/api/admin/erp/shipments${qs}`);
    const data = await res.json();
    setShipments(data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchShipments(statusFilter);
  }, [statusFilter]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">出貨單</h1>
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
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">載入中...</div>
      ) : shipments.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          {statusFilter ? "此狀態下無出貨單" : "尚無出貨單。從銷售訂單詳細頁點「出貨」建立。"}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-2 py-3 w-10" />
                <th className="px-4 py-3 font-medium">出貨單號</th>
                <th className="px-4 py-3 font-medium">出貨日</th>
                <th className="px-4 py-3 font-medium">訂單</th>
                <th className="px-4 py-3 font-medium">客戶</th>
                <th className="px-4 py-3 font-medium">出貨倉</th>
                <th className="px-4 py-3 font-medium">狀態</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => {
                const isOpen = expanded.has(s.id);
                const meta = statusMeta[s.status] || { label: s.status, badge: "bg-gray-100 text-gray-600" };
                return (
                  <Fragment key={s.id}>
                    <tr className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-2 py-3 text-center">
                        <button
                          onClick={() => toggleExpand(s.id)}
                          disabled={s.items.length === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          title={s.items.length === 0 ? "無品項" : "展開 / 收起"}
                        >
                          {isOpen ? "▾" : "▸"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/erp/shipments/${s.id}`}
                          className="font-mono text-blue-600 hover:underline"
                        >
                          {s.shipmentNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{s.shipDate}</td>
                      <td className="px-4 py-3 font-mono text-gray-600">{s.orderNumber || "-"}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{s.customerName || "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{s.warehouseName || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${meta.badge}`}>{meta.label}</span>
                        {s.status === "signed" && s.signedBy && (
                          <span className="ml-1.5 text-xs text-gray-400">{s.signedBy}</span>
                        )}
                      </td>
                    </tr>
                    {isOpen && s.items.length > 0 && (
                      <tr className="bg-gray-50/60">
                        <td className="px-2 py-2" />
                        <td colSpan={6} className="px-4 py-3">
                          <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-gray-100 text-left text-gray-500">
                                  <th className="px-3 py-2 font-medium w-24">品號</th>
                                  <th className="px-3 py-2 font-medium">品名</th>
                                  <th className="px-3 py-2 font-medium w-40">批號</th>
                                  <th className="px-3 py-2 font-medium w-28 text-right">出貨數量</th>
                                </tr>
                              </thead>
                              <tbody>
                                {s.items.map((it) => (
                                  <tr key={it.id} className="border-b border-gray-50 last:border-0">
                                    <td className="px-3 py-2 font-mono text-gray-600">{it.sku}</td>
                                    <td className="px-3 py-2">{it.productName}</td>
                                    <td className="px-3 py-2">
                                      {it.batchNo ? (
                                        <span className="font-mono text-gray-600">
                                          {it.batchNo}
                                          {it.batchExpiry && (
                                            <span className="text-xs text-gray-400 ml-1">({it.batchExpiry})</span>
                                          )}
                                        </span>
                                      ) : (
                                        <span className="text-gray-400">—</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-right tabular-nums">
                                      {it.shippedQuantity} {it.unit}
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
