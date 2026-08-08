"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface ShipmentItem {
  id: string;
  sku: string;
  productName: string;
  unit: string;
  shippedQuantity: number;
  batchNo: string | null;
  batchExpiry: string | null;
  note: string | null;
}

interface ShipmentDetail {
  id: string;
  shipmentNumber: string;
  shipDate: string;
  status: string;
  signedAt: string | null;
  signedBy: string | null;
  shippingAddress: string | null;
  note: string | null;
  orderId: string | null;
  orderNumber: string | null;
  customer: { companyName: string; contactName: string | null; phone: string | null } | null;
  warehouseName: string | null;
  warehouseCode: string | null;
  items: ShipmentItem[];
}

const statusMeta: Record<string, { label: string; badge: string }> = {
  pending: { label: "待出貨", badge: "bg-gray-100 text-gray-600" },
  shipped: { label: "已出貨", badge: "bg-indigo-50 text-indigo-700" },
  signed: { label: "已簽收", badge: "bg-green-50 text-green-700" },
  cancelled: { label: "已取消", badge: "bg-red-50 text-red-600" },
};

export default function ShipmentDetailPage() {
  const params = useParams<{ id: string }>();
  const [shipment, setShipment] = useState<ShipmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  const fetchShipment = useCallback(async () => {
    const res = await fetch(`/api/admin/erp/shipments/${params.id}`);
    if (res.ok) {
      setShipment(await res.json());
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    fetchShipment();
  }, [fetchShipment]);

  const handleSign = async () => {
    if (!shipment) return;
    const signedBy = prompt("請輸入簽收人姓名：");
    if (!signedBy?.trim()) return;
    setWorking(true);
    const res = await fetch(`/api/admin/erp/shipments/${shipment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sign", signedBy }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "簽收失敗");
    }
    setWorking(false);
    fetchShipment();
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">載入中...</div>;
  }
  if (!shipment) {
    return (
      <div className="text-center py-12 text-gray-400">
        找不到出貨單。
        <Link href="/admin/erp/shipments" className="text-blue-600 hover:underline ml-1">返回列表</Link>
      </div>
    );
  }

  const meta = statusMeta[shipment.status] || { label: shipment.status, badge: "bg-gray-100 text-gray-600" };
  const totalQty = shipment.items.reduce((acc, it) => acc + it.shippedQuantity, 0);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin/erp/shipments" className="text-sm text-gray-500 hover:text-gray-700">
            ← 返回列表
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 font-mono">{shipment.shipmentNumber}</h1>
          <span className={`px-2 py-0.5 rounded text-xs ${meta.badge}`}>{meta.label}</span>
        </div>
        <div className="flex gap-2">
          {shipment.status === "shipped" && (
            <button
              onClick={handleSign}
              disabled={working}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              簽收
            </button>
          )}
          <button
            onClick={() => window.open(`/admin/erp/shipments/${shipment.id}/print`, "_blank")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            列印 / 輸出 PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">出貨資訊</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex gap-2">
              <dt className="text-gray-500 w-24 shrink-0">出貨日期</dt>
              <dd className="text-gray-700">{shipment.shipDate}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-24 shrink-0">銷售訂單</dt>
              <dd>
                {shipment.orderId ? (
                  <Link
                    href={`/admin/erp/sales-orders/${shipment.orderId}`}
                    className="font-mono text-blue-600 hover:underline"
                  >
                    {shipment.orderNumber}
                  </Link>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-24 shrink-0">出貨倉</dt>
              <dd className="text-gray-700">
                {shipment.warehouseCode
                  ? `${shipment.warehouseCode} ${shipment.warehouseName}`
                  : shipment.warehouseName || "-"}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-24 shrink-0">送達地址</dt>
              <dd className="text-gray-700">{shipment.shippingAddress || "-"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-24 shrink-0">備註</dt>
              <dd className="text-gray-700">{shipment.note || "-"}</dd>
            </div>
          </dl>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">客戶與簽收</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex gap-2">
              <dt className="text-gray-500 w-24 shrink-0">客戶</dt>
              <dd className="font-medium text-gray-900">{shipment.customer?.companyName || "-"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-24 shrink-0">聯絡人</dt>
              <dd className="text-gray-700">{shipment.customer?.contactName || "-"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-24 shrink-0">電話</dt>
              <dd className="text-gray-700">{shipment.customer?.phone || "-"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-24 shrink-0">簽收人</dt>
              <dd className="text-gray-700">{shipment.signedBy || "尚未簽收"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-24 shrink-0">簽收時間</dt>
              <dd className="text-gray-700">
                {shipment.signedAt ? new Date(shipment.signedAt).toLocaleString("zh-TW") : "-"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="px-4 py-3 font-medium w-24">品號</th>
              <th className="px-4 py-3 font-medium">品名</th>
              <th className="px-4 py-3 font-medium w-40">批號</th>
              <th className="px-4 py-3 font-medium w-28 text-right">出貨數量</th>
              <th className="px-4 py-3 font-medium w-40">品項備註</th>
            </tr>
          </thead>
          <tbody>
            {shipment.items.map((it) => (
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
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{it.shippedQuantity} {it.unit}</td>
                <td className="px-4 py-3 text-gray-500">{it.note || "-"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-100">
              <td colSpan={3} className="px-4 py-3 text-right text-gray-500">合計</td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums">{totalQty}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
