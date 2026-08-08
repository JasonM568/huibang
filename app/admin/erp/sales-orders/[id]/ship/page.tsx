"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface OrderItem {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  unit: string;
  quantity: number;
  shippedQuantity: number;
  batchId: string | null;
  batchNo: string | null;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  warehouseId: string;
  warehouseName: string | null;
  shippingAddress: string | null;
  customer: { companyName: string } | null;
  items: OrderItem[];
}

interface Batch {
  id: string;
  productId: string;
  warehouseId: string | null;
  batchNo: string;
  expiryDate: string | null;
  quantity: number;
}

interface ShipLine {
  soItemId: string;
  quantity: string;
  batchId: string;
}

export default function ShipPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [lines, setLines] = useState<Record<string, ShipLine>>({});
  const [shipDate, setShipDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [shippingAddress, setShippingAddress] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    const [orderRes, batchRes] = await Promise.all([
      fetch(`/api/admin/erp/sales-orders/${params.id}`),
      fetch("/api/admin/erp/sales-orders/batches"),
    ]);
    if (orderRes.ok) {
      const data: OrderDetail = await orderRes.json();
      setOrder(data);
      setShippingAddress(data.shippingAddress || "");
      // 預設帶剩餘量 + 建單時指定的批號
      const initial: Record<string, ShipLine> = {};
      for (const it of data.items) {
        const remaining = it.quantity - it.shippedQuantity;
        if (remaining > 0) {
          initial[it.id] = { soItemId: it.id, quantity: String(remaining), batchId: it.batchId || "" };
        }
      }
      setLines(initial);
    }
    if (batchRes.ok) {
      const data = await batchRes.json();
      setBatches(data.data || []);
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 只列出貨倉裡還有量的批
  const warehouseBatches = useMemo(
    () => batches.filter((b) => b.warehouseId === order?.warehouseId),
    [batches, order?.warehouseId]
  );

  const setLine = (soItemId: string, patch: Partial<ShipLine>) => {
    setLines((prev) => ({ ...prev, [soItemId]: { ...prev[soItemId], ...patch } }));
  };

  const handleSubmit = async () => {
    if (!order) return;
    const items = Object.values(lines)
      .map((l) => ({
        soItemId: l.soItemId,
        quantity: Number(l.quantity) || 0,
        batchId: l.batchId || null,
      }))
      .filter((l) => l.quantity > 0);
    if (items.length === 0) {
      alert("請至少填一項出貨數量");
      return;
    }
    setSubmitting(true);
    const res = await fetch(`/api/admin/erp/sales-orders/${order.id}/ship`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipDate, shippingAddress, note, items }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error || "出貨失敗");
      setSubmitting(false);
      return;
    }
    router.push(`/admin/erp/shipments/${data.id}`);
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

  const shippable = ["confirmed", "processing"].includes(order.status);
  const pendingItems = order.items.filter((it) => it.quantity - it.shippedQuantity > 0);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/erp/sales-orders/${order.id}`} className="text-sm text-gray-500 hover:text-gray-700">
          ← 返回訂單
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          出貨 <span className="font-mono">{order.orderNumber}</span>
        </h1>
      </div>

      {!shippable ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-sm text-amber-800">
          此訂單目前狀態不可出貨（僅「已確認 / 處理中」可出貨）。
        </div>
      ) : pendingItems.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-sm text-green-800">
          所有品項皆已出貨完畢。
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <label className="block text-gray-500 mb-1">出貨日期</label>
                <input
                  type="date"
                  value={shipDate}
                  onChange={(e) => setShipDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-500 mb-1">送達地址（預設訂單地址，可覆寫）</label>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="本次送達地址"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-4 text-sm">
              <label className="block text-gray-500 mb-1">備註</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="出貨備註（選填）"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="mt-3 text-xs text-gray-400">
              客戶：{order.customer?.companyName || "-"}｜出貨倉：{order.warehouseName || "-"}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium w-24">品號</th>
                  <th className="px-4 py-3 font-medium">品名</th>
                  <th className="px-4 py-3 font-medium w-24 text-right">訂購</th>
                  <th className="px-4 py-3 font-medium w-24 text-right">已出</th>
                  <th className="px-4 py-3 font-medium w-28 text-right">本次出貨</th>
                  <th className="px-4 py-3 font-medium w-56">批號</th>
                </tr>
              </thead>
              <tbody>
                {pendingItems.map((it) => {
                  const line = lines[it.id];
                  const remaining = it.quantity - it.shippedQuantity;
                  const productBatches = warehouseBatches.filter((b) => b.productId === it.productId);
                  return (
                    <tr key={it.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3 font-mono text-gray-600">{it.sku}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{it.productName}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{it.quantity} {it.unit}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-500">{it.shippedQuantity}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          max={remaining}
                          value={line?.quantity ?? ""}
                          onChange={(e) => setLine(it.id, { quantity: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="text-[10px] text-gray-400 text-right mt-0.5">剩餘 {remaining}</div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={line?.batchId ?? ""}
                          onChange={(e) => setLine(it.id, { batchId: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">不指定批號</option>
                          {productBatches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.batchNo}
                              {b.expiryDate ? `（效期 ${b.expiryDate}）` : ""}｜剩 {b.quantity}
                            </option>
                          ))}
                        </select>
                        {it.batchNo && (
                          <div className="text-[10px] text-gray-400 mt-0.5">建單指定：{it.batchNo}</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2">
            <Link
              href={`/admin/erp/sales-orders/${order.id}`}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              取消
            </Link>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "出貨中..." : "確認出貨"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
