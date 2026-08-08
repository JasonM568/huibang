"use client";

import React, { useEffect, useState } from "react";

interface ProductRow {
  id: string;
  sku: string;
  name: string;
  unit: string;
  hasExpiry: boolean;
  safetyStock: number;
  isActive: boolean;
}

interface WarehouseRow {
  id: string;
  code: string;
  name: string;
  warehouseType: string;
  parentId: string | null;
}

interface InventoryRow {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
}

interface StockRow {
  productId: string;
  totalQuantity: number;
}

interface BatchRow {
  id: string;
  productId: string;
  warehouseId: string | null;
  batchNo: string;
  expiryDate: string | null;
  quantity: number;
}

interface TransferItem {
  id: string;
  quantity: number;
  receivedQuantity: number;
  sku: string | null;
  productName: string | null;
  unit: string | null;
}

interface TransferRow {
  id: string;
  transferNumber: string;
  status: string;
  note: string | null;
  createdAt: string;
  fromWarehouseName: string | null;
  toWarehouseName: string | null;
  items: TransferItem[];
}

const inputCls =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function StockTab() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseRow[]>([]);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [productStock, setProductStock] = useState<StockRow[]>([]);
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [showEmpty, setShowEmpty] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // 進貨入庫
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [receiveForm, setReceiveForm] = useState({ productId: "", quantity: "", batchNo: "", expiryDate: "" });
  // 分配入倉
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [allocateForm, setAllocateForm] = useState({ productId: "", warehouseId: "", quantity: "", batchId: "" });
  // 調撥
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({ productId: "", fromWarehouseId: "", toWarehouseId: "", quantity: "", note: "" });
  // 調撥紀錄
  const [logOpen, setLogOpen] = useState(false);
  const [transfers, setTransfers] = useState<TransferRow[]>([]);
  const [logLoading, setLogLoading] = useState(false);
  // 盤點調整
  const [adjusting, setAdjusting] = useState<InventoryRow | null>(null);
  const [adjustForm, setAdjustForm] = useState({ newQuantity: "", reason: "" });

  const [saving, setSaving] = useState(false);
  const [dialogError, setDialogError] = useState("");

  const fetchAll = async () => {
    const res = await fetch("/api/admin/erp/stock");
    const data = await res.json();
    setProducts(data.products || []);
    setWarehouses(data.warehouses || []);
    setInventory(data.inventory || []);
    setProductStock(data.productStock || []);
    setBatches(data.batches || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const productOf = (id: string) => products.find((p) => p.id === id);
  const warehouseOf = (id: string | null) => warehouses.find((w) => w.id === id);
  const totalOf = (productId: string) =>
    productStock.find((s) => s.productId === productId)?.totalQuantity ?? 0;
  const allocatedOf = (productId: string) =>
    inventory.filter((i) => i.productId === productId).reduce((sum, i) => sum + i.quantity, 0);
  const stockOf = (productId: string, warehouseId: string) =>
    inventory.find((i) => i.productId === productId && i.warehouseId === warehouseId)?.quantity ?? 0;
  const poolBatchesOf = (productId: string) =>
    batches.filter((b) => b.productId === productId && b.warehouseId === null && b.quantity > 0);

  const expiryBadge = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.ceil((new Date(expiryDate).getTime() - today.getTime()) / 86400000);
    const cls =
      days < 0 || days <= 30
        ? "bg-red-50 text-red-700"
        : days <= 90
        ? "bg-amber-50 text-amber-700"
        : "bg-gray-100 text-gray-600";
    return (
      <span className={`px-1.5 py-0.5 rounded text-xs ${cls}`}>
        {days < 0 ? "已過期" : `${days}天`}
      </span>
    );
  };

  // 未分倉（總庫存 > 已分配）或超出（已分配 > 總庫存）的商品
  const unallocatedProducts = products
    .map((p) => ({ product: p, total: totalOf(p.id), allocated: allocatedOf(p.id) }))
    .filter(({ total, allocated }) => total !== allocated && (total > 0 || allocated > 0));

  const filtered = inventory.filter((item) => {
    if (!showEmpty && item.quantity === 0 && item.reservedQuantity === 0) return false;
    if (warehouseFilter !== "all" && item.warehouseId !== warehouseFilter) return false;
    if (!search) return true;
    const p = productOf(item.productId);
    const q = search.toLowerCase();
    return !!p && (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  });
  const emptyCount = inventory.filter((i) => i.quantity === 0 && i.reservedQuantity === 0).length;

  const toggleRow = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const closeDialogs = () => {
    setReceiveOpen(false);
    setAllocateOpen(false);
    setTransferOpen(false);
    setAdjusting(null);
    setDialogError("");
    setSaving(false);
  };

  const post = async (url: string, method: string, payload: unknown) => {
    setSaving(true);
    setDialogError("");
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setDialogError(data.error || "操作失敗");
      return false;
    }
    return true;
  };

  const handleReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await post("/api/admin/erp/stock-in", "POST", {
      action: "receive",
      productId: receiveForm.productId,
      quantity: Number(receiveForm.quantity),
      batchNo: receiveForm.batchNo,
      expiryDate: receiveForm.expiryDate || null,
    });
    if (ok) {
      closeDialogs();
      setReceiveForm({ productId: "", quantity: "", batchNo: "", expiryDate: "" });
      fetchAll();
    }
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await post("/api/admin/erp/stock-in", "POST", {
      action: "allocate",
      productId: allocateForm.productId,
      warehouseId: allocateForm.warehouseId,
      quantity: Number(allocateForm.quantity),
      batchId: allocateForm.batchId || null,
    });
    if (ok) {
      closeDialogs();
      setAllocateForm({ productId: "", warehouseId: "", quantity: "", batchId: "" });
      fetchAll();
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await post("/api/admin/erp/transfers", "POST", {
      productId: transferForm.productId,
      fromWarehouseId: transferForm.fromWarehouseId,
      toWarehouseId: transferForm.toWarehouseId,
      quantity: Number(transferForm.quantity),
      note: transferForm.note,
    });
    if (ok) {
      closeDialogs();
      setTransferForm({ productId: "", fromWarehouseId: "", toWarehouseId: "", quantity: "", note: "" });
      fetchAll();
    }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjusting) return;
    const ok = await post("/api/admin/erp/stock", "PATCH", {
      inventoryId: adjusting.id,
      newQuantity: Number(adjustForm.newQuantity),
      reason: adjustForm.reason,
    });
    if (ok) {
      closeDialogs();
      fetchAll();
    }
  };

  const handleDeleteEmpty = async (item: InventoryRow) => {
    const p = productOf(item.productId);
    const w = warehouseOf(item.warehouseId);
    if (!confirm(`確定刪除空庫存紀錄？\n商品：${p?.name ?? ""}\n倉庫：${w?.name ?? ""}\n（quantity = 0，不影響歷史異動）`)) return;
    const res = await fetch(`/api/admin/erp/stock?id=${item.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "刪除失敗");
      return;
    }
    fetchAll();
  };

  const openLog = async () => {
    setLogOpen(true);
    setLogLoading(true);
    const res = await fetch("/api/admin/erp/transfers");
    const data = await res.json();
    setTransfers(data.data || []);
    setLogLoading(false);
  };

  const allocateProduct = productOf(allocateForm.productId);
  const allocatePool = allocateForm.productId ? poolBatchesOf(allocateForm.productId) : [];
  const receiveProduct = productOf(receiveForm.productId);

  const transferStatusLabel: Record<string, string> = {
    draft: "草稿",
    in_transit: "調撥中",
    completed: "已完成",
    cancelled: "已取消",
  };

  if (loading) return <div className="text-center py-12 text-gray-400">載入中...</div>;

  return (
    <div>
      {/* 操作列 */}
      <div className="flex items-center justify-end gap-2 mb-4 flex-wrap">
        <button
          onClick={openLog}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
        >
          調撥紀錄
        </button>
        <button
          onClick={() => { setDialogError(""); setTransferOpen(true); }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
        >
          倉庫調撥
        </button>
        <button
          onClick={() => { setDialogError(""); setAllocateOpen(true); }}
          className="px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50"
        >
          分配入倉
        </button>
        <button
          onClick={() => { setDialogError(""); setReceiveOpen(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + 進貨入庫
        </button>
      </div>

      {/* 未分倉/超出 提示區 */}
      {unallocatedProducts.length > 0 && (
        <div className="mb-4 space-y-2">
          {unallocatedProducts.map(({ product, total, allocated }) => {
            const pool = poolBatchesOf(product.id);
            const over = allocated > total;
            return (
              <div
                key={product.id}
                className={`rounded-xl border px-4 py-3 text-sm flex items-center justify-between gap-3 flex-wrap ${
                  over ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-gray-500">{product.sku}</span>
                  <span className="font-medium text-gray-900">{product.name}</span>
                  {pool.map((b) => (
                    <span key={b.id} className="px-1.5 py-0.5 bg-white border border-amber-200 rounded text-xs text-gray-600">
                      {b.batchNo}｜{b.expiryDate ?? "無效期"}｜剩 {b.quantity}
                    </span>
                  ))}
                </div>
                <div className={over ? "text-red-700" : "text-amber-700"}>
                  總庫存 {total}｜已分配 {allocated}｜
                  {over ? `超出 ${allocated - total}` : `未分配 ${total - allocated}`}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 篩選列 */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜尋 SKU / 品名"
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
        />
        <select
          value={warehouseFilter}
          onChange={(e) => setWarehouseFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">全部倉庫</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
        {emptyCount > 0 && (
          <button
            onClick={() => setShowEmpty((v) => !v)}
            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
          >
            {showEmpty ? "隱藏空紀錄" : `顯示空紀錄（${emptyCount}）`}
          </button>
        )}
      </div>

      {/* 庫存表 */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          {search ? "找不到符合的庫存資料" : "尚無庫存資料，點「進貨入庫」開始進貨"}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-4 py-3 font-medium w-8"></th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">品名</th>
                <th className="px-4 py-3 font-medium">倉庫</th>
                <th className="px-4 py-3 font-medium text-right">庫存</th>
                <th className="px-4 py-3 font-medium text-right">可用</th>
                <th className="px-4 py-3 font-medium text-right">安全庫存</th>
                <th className="px-4 py-3 font-medium">狀態</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const p = productOf(item.productId);
                const w = warehouseOf(item.warehouseId);
                const available = item.quantity - item.reservedQuantity;
                const isLow = !!p?.safetyStock && item.quantity <= p.safetyStock;
                const whBatches = batches.filter(
                  (b) => b.productId === item.productId && b.warehouseId === item.warehouseId
                );
                const isExpanded = expanded.has(item.id);
                return (
                  <React.Fragment key={item.id}>
                    <tr
                      className={`border-b border-gray-50 hover:bg-gray-50 ${whBatches.length > 0 ? "cursor-pointer" : ""}`}
                      onClick={() => whBatches.length > 0 && toggleRow(item.id)}
                    >
                      <td className="px-4 py-3 text-gray-400">
                        {whBatches.length > 0 && (isExpanded ? "▾" : "▸")}
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-600">{p?.sku}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {p?.name}
                        {whBatches.length > 0 && (
                          <span className="ml-2 text-xs text-gray-400">（{whBatches.length} 批）</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {w?.parentId ? "└ " : ""}
                        {w?.name}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {item.quantity.toLocaleString()} {p?.unit}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{available.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{p?.safetyStock || "—"}</td>
                      <td className="px-4 py-3">
                        {isLow ? (
                          <span className="px-1.5 py-0.5 bg-red-50 text-red-700 rounded text-xs">低庫存</span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-xs">正常</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setDialogError("");
                            setAdjustForm({ newQuantity: String(item.quantity), reason: "" });
                            setAdjusting(item);
                          }}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          調整
                        </button>
                        {item.quantity === 0 && (
                          <button onClick={() => handleDeleteEmpty(item)} className="text-red-500 hover:text-red-700">
                            刪除
                          </button>
                        )}
                      </td>
                    </tr>
                    {isExpanded &&
                      whBatches.map((b) => (
                        <tr key={b.id} className="border-b border-gray-50 bg-gray-50/60 text-sm">
                          <td className="px-4 py-2" />
                          <td className="px-4 py-2" />
                          <td className="px-4 py-2 pl-8 font-mono text-gray-600" colSpan={2}>
                            批號 {b.batchNo}
                          </td>
                          <td className="px-4 py-2 text-right text-gray-600">{b.quantity}</td>
                          <td className="px-4 py-2 text-right text-gray-600" colSpan={2}>
                            {b.expiryDate ?? "—"}
                          </td>
                          <td className="px-4 py-2" colSpan={2}>
                            {expiryBadge(b.expiryDate)}
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 進貨入庫 Dialog */}
      {receiveOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold mb-1">進貨入庫</h2>
            <p className="text-sm text-gray-500 mb-4">數量加入商品總庫存；之後用「分配入倉」分到各倉。</p>
            <form onSubmit={handleReceive} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">商品 *</label>
                <select
                  required
                  value={receiveForm.productId}
                  onChange={(e) => setReceiveForm({ ...receiveForm, productId: e.target.value })}
                  className={inputCls}
                >
                  <option value="">選擇商品</option>
                  {products.filter((p) => p.isActive).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} — {p.name}（總庫存 {totalOf(p.id)}）
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    批號 {receiveProduct?.hasExpiry ? "*（此商品有效期）" : "（選填）"}
                  </label>
                  <input
                    required={receiveProduct?.hasExpiry ?? false}
                    value={receiveForm.batchNo}
                    onChange={(e) => setReceiveForm({ ...receiveForm, batchNo: e.target.value })}
                    placeholder="如：LOT-20260801"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">有效期限</label>
                  <input
                    type="date"
                    value={receiveForm.expiryDate}
                    onChange={(e) => setReceiveForm({ ...receiveForm, expiryDate: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">進貨數量 *</label>
                <input
                  required
                  type="number"
                  min={1}
                  value={receiveForm.quantity}
                  onChange={(e) => setReceiveForm({ ...receiveForm, quantity: e.target.value })}
                  className={inputCls}
                />
              </div>
              {dialogError && <p className="text-sm text-red-600">{dialogError}</p>}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "處理中..." : "確認進貨"}
                </button>
                <button type="button" onClick={closeDialogs} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 分配入倉 Dialog */}
      {allocateOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold mb-1">分配入倉</h2>
            <p className="text-sm text-gray-500 mb-4">從商品總庫存分配數量到指定倉庫（不增加總庫存）。</p>
            <form onSubmit={handleAllocate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">商品 *</label>
                <select
                  required
                  value={allocateForm.productId}
                  onChange={(e) => setAllocateForm({ ...allocateForm, productId: e.target.value, batchId: "" })}
                  className={inputCls}
                >
                  <option value="">選擇商品</option>
                  {products.filter((p) => totalOf(p.id) > 0).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} — {p.name}（總庫存 {totalOf(p.id)}）
                    </option>
                  ))}
                </select>
              </div>
              {allocateForm.productId && (
                <div className="rounded-lg bg-gray-50 p-3 text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-gray-500">總庫存</span><strong>{totalOf(allocateForm.productId)}</strong></div>
                  <div className="flex justify-between"><span className="text-gray-500">已分配到倉庫</span><strong>{allocatedOf(allocateForm.productId)}</strong></div>
                  <div className="flex justify-between border-t border-gray-200 pt-1">
                    <span className="text-gray-500">可分配餘量</span>
                    <strong className={totalOf(allocateForm.productId) - allocatedOf(allocateForm.productId) <= 0 ? "text-red-600" : ""}>
                      {totalOf(allocateForm.productId) - allocatedOf(allocateForm.productId)}
                    </strong>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">目標倉庫 *</label>
                <select
                  required
                  value={allocateForm.warehouseId}
                  onChange={(e) => setAllocateForm({ ...allocateForm, warehouseId: e.target.value })}
                  className={inputCls}
                >
                  <option value="">選擇倉庫</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.parentId ? "└ " : ""}{w.code} — {w.name}（現有 {allocateForm.productId ? stockOf(allocateForm.productId, w.id) : 0}）
                    </option>
                  ))}
                </select>
              </div>
              {allocateProduct?.hasExpiry && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">批號 *（此商品有效期）</label>
                  {allocatePool.length === 0 ? (
                    <p className="text-sm text-red-600">未分配池沒有可用批次，請先「進貨入庫」建立批號。</p>
                  ) : (
                    <select
                      required
                      value={allocateForm.batchId}
                      onChange={(e) => setAllocateForm({ ...allocateForm, batchId: e.target.value })}
                      className={inputCls}
                    >
                      <option value="">選擇批號（依效期短至長）</option>
                      {allocatePool.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.batchNo}｜{b.expiryDate ?? "無效期"}｜剩 {b.quantity}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分配數量 *</label>
                <input
                  required
                  type="number"
                  min={1}
                  value={allocateForm.quantity}
                  onChange={(e) => setAllocateForm({ ...allocateForm, quantity: e.target.value })}
                  className={inputCls}
                />
              </div>
              {dialogError && <p className="text-sm text-red-600">{dialogError}</p>}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "處理中..." : "確認分配"}
                </button>
                <button type="button" onClick={closeDialogs} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 倉庫調撥 Dialog */}
      {transferOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold mb-1">倉庫調撥</h2>
            <p className="text-sm text-gray-500 mb-4">倉庫間移動庫存，不改變總庫存，會產生調撥單。</p>
            <form onSubmit={handleTransfer} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">商品 *</label>
                <select
                  required
                  value={transferForm.productId}
                  onChange={(e) => setTransferForm({ ...transferForm, productId: e.target.value })}
                  className={inputCls}
                >
                  <option value="">選擇商品</option>
                  {products.filter((p) => allocatedOf(p.id) > 0).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} — {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">從（來源倉）*</label>
                  <select
                    required
                    value={transferForm.fromWarehouseId}
                    onChange={(e) => setTransferForm({ ...transferForm, fromWarehouseId: e.target.value })}
                    className={inputCls}
                  >
                    <option value="">選擇</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.parentId ? "└ " : ""}{w.name}（{transferForm.productId ? stockOf(transferForm.productId, w.id) : 0}）
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">到（目標倉）*</label>
                  <select
                    required
                    value={transferForm.toWarehouseId}
                    onChange={(e) => setTransferForm({ ...transferForm, toWarehouseId: e.target.value })}
                    className={inputCls}
                  >
                    <option value="">選擇</option>
                    {warehouses.filter((w) => w.id !== transferForm.fromWarehouseId).map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.parentId ? "└ " : ""}{w.name}（{transferForm.productId ? stockOf(transferForm.productId, w.id) : 0}）
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">調撥數量 *</label>
                <input
                  required
                  type="number"
                  min={1}
                  value={transferForm.quantity}
                  onChange={(e) => setTransferForm({ ...transferForm, quantity: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
                <input
                  value={transferForm.note}
                  onChange={(e) => setTransferForm({ ...transferForm, note: e.target.value })}
                  placeholder="例：門市補貨"
                  className={inputCls}
                />
              </div>
              {transferForm.productId &&
                transferForm.fromWarehouseId &&
                Number(transferForm.quantity) > stockOf(transferForm.productId, transferForm.fromWarehouseId) && (
                  <p className="text-sm text-red-600">
                    來源倉庫庫存不足（目前 {stockOf(transferForm.productId, transferForm.fromWarehouseId)}）
                  </p>
                )}
              {dialogError && <p className="text-sm text-red-600">{dialogError}</p>}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "處理中..." : "確認調撥（產生調撥單）"}
                </button>
                <button type="button" onClick={closeDialogs} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 盤點調整 Dialog */}
      {adjusting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold mb-4">盤點調整</h2>
            <form onSubmit={handleAdjust} className="space-y-3">
              <div className="rounded-lg bg-gray-50 p-3 text-sm space-y-1">
                <div>
                  商品：<span className="font-medium">{productOf(adjusting.productId)?.name ?? "—"}</span>
                  <span className="font-mono text-xs ml-2 text-gray-500">{productOf(adjusting.productId)?.sku}</span>
                </div>
                <div>倉庫：{warehouseOf(adjusting.warehouseId)?.name ?? "—"}</div>
                <div>
                  目前庫存：<span className="font-medium">{adjusting.quantity}</span>（已保留 {adjusting.reservedQuantity}）
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">新數量 *</label>
                <input
                  required
                  type="number"
                  min={adjusting.reservedQuantity}
                  value={adjustForm.newQuantity}
                  onChange={(e) => setAdjustForm({ ...adjustForm, newQuantity: e.target.value })}
                  className={inputCls}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  正數差 = 盤盈；負數差 = 盤虧／損耗／過期報廢。總庫存會同步加減差值。最低不可低於已保留量 {adjusting.reservedQuantity}。
                </p>
              </div>
              {adjustForm.newQuantity !== "" && Number(adjustForm.newQuantity) !== adjusting.quantity && (
                <p className="text-sm text-gray-500">
                  差異：{Number(adjustForm.newQuantity) - adjusting.quantity > 0 ? "+" : ""}
                  {Number(adjustForm.newQuantity) - adjusting.quantity}
                </p>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">調整原因 *</label>
                <textarea
                  required
                  rows={2}
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  placeholder="例：月底盤點實際 / 損壞報廢 / 過期銷毀 / 系統錯帳更正"
                  className={inputCls}
                />
              </div>
              {dialogError && <p className="text-sm text-red-600">{dialogError}</p>}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "處理中..." : "送出調整"}
                </button>
                <button type="button" onClick={closeDialogs} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 調撥紀錄 Dialog */}
      {logOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">調撥紀錄</h2>
              <button onClick={() => setLogOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            {logLoading ? (
              <div className="text-center py-8 text-gray-400">載入中...</div>
            ) : transfers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">尚無調撥紀錄</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="px-3 py-2 font-medium">單號</th>
                    <th className="px-3 py-2 font-medium">來源 → 目標</th>
                    <th className="px-3 py-2 font-medium">品項</th>
                    <th className="px-3 py-2 font-medium">日期</th>
                    <th className="px-3 py-2 font-medium">狀態</th>
                    <th className="px-3 py-2 font-medium">備註</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((t) => (
                    <tr key={t.id} className="border-b border-gray-50 align-top">
                      <td className="px-3 py-2 font-mono text-gray-700">{t.transferNumber}</td>
                      <td className="px-3 py-2 text-gray-600">
                        {t.fromWarehouseName ?? "—"} → {t.toWarehouseName ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {t.items.map((i) => (
                          <div key={i.id}>
                            {i.sku} {i.productName}｜{i.quantity} {i.unit}
                          </div>
                        ))}
                      </td>
                      <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleDateString("zh-TW")}
                      </td>
                      <td className="px-3 py-2">
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          {transferStatusLabel[t.status] ?? t.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-500">{t.note ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
