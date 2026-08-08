"use client";

import React, { useEffect, useState } from "react";

interface ExpiryBatch {
  id: string;
  productId: string;
  warehouseId: string | null;
  batchNo: string;
  expiryDate: string;
  quantity: number;
  sku: string | null;
  productName: string | null;
  unit: string | null;
  expiryAlertDays: number | null;
  warehouseCode: string | null;
  warehouseName: string | null;
}

interface InventoryDist {
  productId: string;
  warehouseId: string;
  quantity: number;
  warehouseCode: string | null;
  warehouseName: string | null;
}

// 效期四段：已過期 / 即將到期（≤ 警示天數）/ 接近到期（≤ 警示天數×2）/ 安全
function daysUntil(expiryDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(expiryDate).getTime() - today.getTime()) / 86400000);
}

export default function ExpiryTab() {
  const [batches, setBatches] = useState<ExpiryBatch[]>([]);
  const [inventory, setInventory] = useState<InventoryDist[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/erp/expiry");
      const data = await res.json();
      setBatches(data.batches || []);
      setInventory(data.inventory || []);
      setLoading(false);
    })();
  }, []);

  const alertDaysOf = (b: ExpiryBatch) => b.expiryAlertDays ?? 30;

  const statusOf = (b: ExpiryBatch) => {
    const days = daysUntil(b.expiryDate);
    const alertDays = alertDaysOf(b);
    if (days < 0) return { key: "expired", label: "已過期", cls: "bg-red-50 text-red-700", rowCls: "bg-red-50/50" };
    if (days <= alertDays) return { key: "alerting", label: `${days} 天後到期`, cls: "bg-red-50 text-red-700", rowCls: "bg-orange-50/60" };
    if (days <= alertDays * 2) return { key: "approaching", label: `${days} 天後到期`, cls: "bg-amber-50 text-amber-700", rowCls: "" };
    return { key: "safe", label: `${days} 天後到期`, cls: "bg-gray-100 text-gray-600", rowCls: "" };
  };

  const counts = {
    expired: batches.filter((b) => daysUntil(b.expiryDate) < 0).length,
    alerting: batches.filter((b) => {
      const d = daysUntil(b.expiryDate);
      return d >= 0 && d <= alertDaysOf(b);
    }).length,
    approaching: batches.filter((b) => {
      const d = daysUntil(b.expiryDate);
      return d > alertDaysOf(b) && d <= alertDaysOf(b) * 2;
    }).length,
    safe: batches.filter((b) => daysUntil(b.expiryDate) > alertDaysOf(b) * 2).length,
  };

  const distOf = (productId: string) => inventory.filter((i) => i.productId === productId);

  const toggleRow = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) return <div className="text-center py-12 text-gray-400">載入中...</div>;

  return (
    <div>
      {/* 統計卡 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <div className="text-2xl font-bold text-red-700">{counts.expired}</div>
          <div className="text-sm text-red-700">已過期</div>
        </div>
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-center">
          <div className="text-2xl font-bold text-orange-700">{counts.alerting}</div>
          <div className="text-sm text-orange-700">即將到期</div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
          <div className="text-2xl font-bold text-amber-700">{counts.approaching}</div>
          <div className="text-sm text-amber-700">接近到期</div>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{counts.safe}</div>
          <div className="text-sm text-green-700">安全</div>
        </div>
      </div>

      {batches.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          尚無有效期限資料。在「庫存查詢」用「進貨入庫」填批號與有效期限後，資料會出現在這裡。
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-4 py-3 font-medium w-8"></th>
                <th className="px-4 py-3 font-medium">狀態</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">品名</th>
                <th className="px-4 py-3 font-medium">批號</th>
                <th className="px-4 py-3 font-medium">有效期限</th>
                <th className="px-4 py-3 font-medium">提醒</th>
                <th className="px-4 py-3 font-medium">批號位置</th>
                <th className="px-4 py-3 font-medium text-right">數量</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => {
                const status = statusOf(b);
                const dist = distOf(b.productId);
                const isExpanded = expanded.has(b.id);
                return (
                  <React.Fragment key={b.id}>
                    <tr
                      className={`border-b border-gray-50 hover:bg-gray-50 ${status.rowCls} ${dist.length > 0 ? "cursor-pointer" : ""}`}
                      onClick={() => dist.length > 0 && toggleRow(b.id)}
                    >
                      <td className="px-4 py-3 text-gray-400">{dist.length > 0 && (isExpanded ? "▾" : "▸")}</td>
                      <td className="px-4 py-3">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${status.cls}`}>{status.label}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-600">{b.sku}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{b.productName}</td>
                      <td className="px-4 py-3 font-mono text-gray-700">{b.batchNo}</td>
                      <td className="px-4 py-3 text-gray-700">{b.expiryDate}</td>
                      <td className="px-4 py-3 text-gray-500">前 {alertDaysOf(b)} 天</td>
                      <td className="px-4 py-3 text-gray-600">
                        {b.warehouseId ? `${b.warehouseCode ?? ""} ${b.warehouseName ?? ""}` : (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">未分配池</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {b.quantity} {b.unit}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="border-b border-gray-50 bg-gray-50/60">
                        <td className="px-4 py-2" />
                        <td className="px-4 py-2" colSpan={8}>
                          <p className="text-xs text-gray-500 mb-1.5">此商品在各倉庫的庫存分佈</p>
                          <div className="flex flex-wrap gap-2">
                            {dist.map((inv) => (
                              <span
                                key={inv.warehouseId}
                                className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-700"
                              >
                                {inv.warehouseCode} {inv.warehouseName}：{inv.quantity} {b.unit}
                              </span>
                            ))}
                            {dist.length === 0 && (
                              <span className="text-xs text-gray-400">尚未分配到任何倉庫</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
