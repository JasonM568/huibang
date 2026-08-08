"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  discountRate: string;
  subtotal: string;
  taxAmount: string;
  total: string;
  batchNo: string | null;
  batchExpiry: string | null;
  note: string | null;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  orderDate: string;
  expectedShipDate: string | null;
  status: string;
  taxMethod: string;
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  shippingAddress: string | null;
  note: string | null;
  customer: {
    companyName: string;
    customerType: string;
    contactName: string | null;
    phone: string | null;
    paymentTerms: string | null;
  } | null;
  warehouseName: string | null;
  warehouseCode: string | null;
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

const typeLabel: Record<string, string> = { wholesale: "批發", dealer: "經銷", retail: "零售" };

const tierMeta: Record<string, { label: string; color: string }> = {
  wholesale: { label: "批發價", color: "text-blue-600" },
  group: { label: "團購價", color: "text-purple-600" },
  retail: { label: "零售價", color: "text-green-600" },
  custom: { label: "自訂", color: "text-amber-600" },
};

interface ShipmentSummary {
  id: string;
  shipmentNumber: string;
  shipDate: string;
  status: string;
  signedBy: string | null;
  items: { id: string; shippedQuantity: number }[];
}

const shipmentStatusMeta: Record<string, { label: string; badge: string }> = {
  pending: { label: "待出貨", badge: "bg-gray-100 text-gray-600" },
  shipped: { label: "已出貨", badge: "bg-indigo-50 text-indigo-700" },
  signed: { label: "已簽收", badge: "bg-green-50 text-green-700" },
  cancelled: { label: "已取消", badge: "bg-red-50 text-red-600" },
};

export default function SalesOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [shipments, setShipments] = useState<ShipmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  const fetchOrder = useCallback(async () => {
    const [res, shipRes] = await Promise.all([
      fetch(`/api/admin/erp/sales-orders/${params.id}`),
      fetch(`/api/admin/erp/shipments?salesOrderId=${params.id}`),
    ]);
    if (res.ok) {
      setOrder(await res.json());
    }
    if (shipRes.ok) {
      const data = await shipRes.json();
      setShipments(data.data || []);
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const updateStatus = async (status: string, confirmMsg: string) => {
    if (!order || !confirm(confirmMsg)) return;
    setWorking(true);
    const res = await fetch(`/api/admin/erp/sales-orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "更新失敗");
    }
    setWorking(false);
    fetchOrder();
  };

  const handleDelete = async () => {
    if (!order || !confirm(`確定要刪除 ${order.orderNumber}？此動作無法復原。`)) return;
    setWorking(true);
    const res = await fetch(`/api/admin/erp/sales-orders/${order.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "刪除失敗");
      setWorking(false);
      return;
    }
    router.push("/admin/erp/sales-orders");
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">載入中...</div>;
  }
  if (!order) {
    return (
      <div className="text-center py-12 text-gray-400">
        找不到訂單。
        <Link href="/admin/erp/sales-orders" className="text-blue-600 hover:underline ml-1">返回列表</Link>
      </div>
    );
  }

  const meta = statusMeta[order.status] || { label: order.status, badge: "bg-gray-100 text-gray-600" };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin/erp/sales-orders" className="text-sm text-gray-500 hover:text-gray-700">
            ← 返回列表
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 font-mono">{order.orderNumber}</h1>
          <span className={`px-2 py-0.5 rounded text-xs ${meta.badge}`}>{meta.label}</span>
        </div>
        <div className="flex gap-2">
          {["confirmed", "processing"].includes(order.status) && (
            <Link
              href={`/admin/erp/sales-orders/${order.id}/ship`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              🚚 出貨
            </Link>
          )}
          {order.status === "confirmed" && (
            <button
              onClick={() => updateStatus("processing", "將訂單標記為「處理中」？")}
              disabled={working}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50"
            >
              標記處理中
            </button>
          )}
          {!["cancelled", "shipped", "completed"].includes(order.status) && (
            <button
              onClick={() => updateStatus("cancelled", `確定要取消 ${order.orderNumber}？`)}
              disabled={working}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
            >
              取消訂單
            </button>
          )}
          {["draft", "confirmed", "cancelled"].includes(order.status) && (
            <button
              onClick={handleDelete}
              disabled={working}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50"
            >
              刪除
            </button>
          )}
        </div>
      </div>

      {/* 基本資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">客戶資訊</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex gap-2">
              <dt className="text-gray-500 w-20 shrink-0">客戶</dt>
              <dd className="font-medium text-gray-900">
                {order.customer?.companyName || "-"}
                {order.customer && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                    {typeLabel[order.customer.customerType] || order.customer.customerType}
                  </span>
                )}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-20 shrink-0">聯絡人</dt>
              <dd className="text-gray-700">{order.customer?.contactName || "-"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-20 shrink-0">電話</dt>
              <dd className="text-gray-700">{order.customer?.phone || "-"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-20 shrink-0">付款條件</dt>
              <dd className="text-gray-700">{order.customer?.paymentTerms || "-"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-20 shrink-0">送貨地址</dt>
              <dd className="text-gray-700">{order.shippingAddress || "-"}</dd>
            </div>
          </dl>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">訂單資訊</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex gap-2">
              <dt className="text-gray-500 w-24 shrink-0">訂單日期</dt>
              <dd className="text-gray-700">{order.orderDate}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-24 shrink-0">預計出貨日</dt>
              <dd className="text-gray-700">{order.expectedShipDate || "-"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-24 shrink-0">出貨倉</dt>
              <dd className="text-gray-700">
                {order.warehouseCode ? `${order.warehouseCode} ${order.warehouseName}` : order.warehouseName || "-"}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-24 shrink-0">稅額計算</dt>
              <dd className="text-gray-700">{order.taxMethod === "tax_included" ? "含稅" : "稅外加（未稅）"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-24 shrink-0">備註</dt>
              <dd className="text-gray-700">{order.note || "-"}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* 品項 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="px-4 py-3 font-medium w-24">品號</th>
              <th className="px-4 py-3 font-medium">品名</th>
              <th className="px-4 py-3 font-medium w-40">批號</th>
              <th className="px-4 py-3 font-medium w-28 text-right">單價</th>
              <th className="px-4 py-3 font-medium w-20 text-right">折扣 %</th>
              <th className="px-4 py-3 font-medium w-24 text-right">數量</th>
              <th className="px-4 py-3 font-medium w-24 text-right">已出</th>
              <th className="px-4 py-3 font-medium w-28 text-right">小計</th>
              <th className="px-4 py-3 font-medium w-24 text-right">稅額</th>
              <th className="px-4 py-3 font-medium w-28 text-right">合計</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it) => {
              const tier = it.priceTier ? tierMeta[it.priceTier] : null;
              return (
                <tr key={it.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3 font-mono text-gray-600">{it.sku}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{it.productName}</td>
                  <td className="px-4 py-3">
                    {it.batchNo ? (
                      <span className="font-mono text-gray-600">
                        {it.batchNo}
                        {it.batchExpiry && <span className="text-xs text-gray-400 ml-1">({it.batchExpiry})</span>}
                      </span>
                    ) : (
                      <span className="text-gray-400">未指定</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {Number(it.unitPrice).toLocaleString()}
                    {tier && <div className={`text-[10px] font-medium ${tier.color}`}>🏷 {tier.label}</div>}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-500">
                    {Number(it.discountRate) > 0 ? `${Number(it.discountRate)}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{it.quantity} {it.unit}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-500">
                    {it.shippedQuantity > 0 ? `${it.shippedQuantity} ${it.unit}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{Number(it.subtotal).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-500">{Number(it.taxAmount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{Number(it.total).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 合計 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex justify-end mb-4">
        <dl className="space-y-1.5 text-sm w-64">
          <div className="flex justify-between">
            <dt className="text-gray-500">未稅小計</dt>
            <dd className="tabular-nums">{Number(order.subtotal).toLocaleString()}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">稅額</dt>
            <dd className="tabular-nums">{Number(order.taxAmount).toLocaleString()}</dd>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-1.5">
            <dt className="font-medium text-gray-900">總金額</dt>
            <dd className="text-lg font-bold tabular-nums text-blue-600">
              ${Number(order.totalAmount).toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>

      {/* 出貨紀錄 */}
      {shipments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">出貨紀錄</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-2 py-2 font-medium">出貨單號</th>
                <th className="px-2 py-2 font-medium">出貨日</th>
                <th className="px-2 py-2 font-medium text-right">件數</th>
                <th className="px-2 py-2 font-medium">狀態</th>
                <th className="px-2 py-2 font-medium">簽收人</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => {
                const sm = shipmentStatusMeta[s.status] || { label: s.status, badge: "bg-gray-100 text-gray-600" };
                return (
                  <tr key={s.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-2 py-2">
                      <Link
                        href={`/admin/erp/shipments/${s.id}`}
                        className="font-mono text-blue-600 hover:underline"
                      >
                        {s.shipmentNumber}
                      </Link>
                    </td>
                    <td className="px-2 py-2 text-gray-600">{s.shipDate}</td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      {s.items.reduce((acc, it) => acc + it.shippedQuantity, 0)}
                    </td>
                    <td className="px-2 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${sm.badge}`}>{sm.label}</span>
                    </td>
                    <td className="px-2 py-2 text-gray-600">{s.signedBy || "-"}</td>
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
