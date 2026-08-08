"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Customer {
  id: string;
  companyName: string;
  customerType: string; // wholesale | dealer | retail
  address: string | null;
  isActive: boolean;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  unit: string;
  sellingPrice: string;
  wholesalePrice: string;
  groupPrice: string;
  isActive: boolean;
}

interface Warehouse {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

interface Batch {
  id: string;
  productId: string;
  warehouseId: string | null;
  batchNo: string;
  expiryDate: string | null;
  quantity: number;
  warehouseName: string | null;
}

// 數字欄位用 string 存：讓使用者能清空、輸入中間狀態（Number('') = 0 會把空欄位打回 0）
interface LineItem {
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  quantity: string;
  unitPrice: string;
  discountRate: string;
  batchId: string | null; // null = 不指定，出貨時決定
  subtotal: number;
  taxAmount: number;
  total: number;
}

function parseNum(s: string): number {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

// 三階帶價：批發→批發價、經銷→團購價、零售→零售價；0 則 fallback 零售價
function pickPrice(p: Product, customerType: string | undefined): number {
  const selling = Number(p.sellingPrice);
  if (customerType === "wholesale") return Number(p.wholesalePrice) || selling;
  if (customerType === "dealer") return Number(p.groupPrice) || selling;
  return selling;
}

// 比對單價與三階價格，回傳目前帶的是哪一階（標籤用）
function priceTier(unitPrice: number, p: Product): { key: string; label: string; color: string } {
  const eq = (a: number, b: number) => Math.abs(a - b) < 0.005;
  const selling = Number(p.sellingPrice);
  const wholesale = Number(p.wholesalePrice) || selling;
  const group = Number(p.groupPrice) || selling;
  if (eq(unitPrice, wholesale) && Number(p.wholesalePrice) > 0)
    return { key: "wholesale", label: "批發價", color: "text-blue-600" };
  if (eq(unitPrice, group) && Number(p.groupPrice) > 0)
    return { key: "group", label: "團購價", color: "text-purple-600" };
  if (eq(unitPrice, selling)) return { key: "retail", label: "零售價", color: "text-green-600" };
  return { key: "custom", label: "自訂", color: "text-amber-600" };
}

function calcTax(amount: number, taxMethod: string) {
  if (taxMethod === "tax_included") {
    const taxAmount = Math.round((amount * 5) / 105);
    return { subtotal: amount - taxAmount, taxAmount, total: amount };
  }
  const taxAmount = Math.round(amount * 0.05);
  return { subtotal: amount, taxAmount, total: amount + taxAmount };
}

const typeLabel: Record<string, string> = { wholesale: "批發", dealer: "經銷", retail: "零售" };

export default function NewSalesOrderPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [productPicker, setProductPicker] = useState("");

  const [form, setForm] = useState({
    customerId: "",
    warehouseId: "",
    orderDate: new Date().toISOString().split("T")[0],
    expectedShipDate: "",
    taxMethod: "tax_excluded",
    shippingAddress: "",
    note: "",
  });
  const [items, setItems] = useState<LineItem[]>([]);

  useEffect(() => {
    (async () => {
      const [cRes, pRes, wRes, bRes] = await Promise.all([
        fetch("/api/admin/erp/customers"),
        fetch("/api/admin/erp/products"),
        fetch("/api/admin/erp/warehouses"),
        fetch("/api/admin/erp/sales-orders/batches"),
      ]);
      const [c, p, w, b] = await Promise.all([cRes.json(), pRes.json(), wRes.json(), bRes.json()]);
      setCustomers((c.data || []).filter((x: Customer) => x.isActive));
      setProducts((p.data || []).filter((x: Product) => x.isActive));
      setWarehouses((w.data || []).filter((x: Warehouse) => x.isActive));
      setBatches(b.data || []);
      setLoading(false);
    })();
  }, []);

  const recalcItem = (item: LineItem, taxMethod: string): LineItem => {
    const amount = parseNum(item.quantity) * parseNum(item.unitPrice) * (1 - parseNum(item.discountRate) / 100);
    const tax = calcTax(amount, taxMethod);
    return { ...item, subtotal: tax.subtotal, taxAmount: tax.taxAmount, total: tax.total };
  };

  const addItem = (productId: string) => {
    const p = products.find((x) => x.id === productId);
    if (!p || items.some((i) => i.productId === productId)) return;
    const cust = customers.find((c) => c.id === form.customerId);
    const price = pickPrice(p, cust?.customerType);
    const newItem: LineItem = {
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      unit: p.unit,
      quantity: "1",
      unitPrice: String(price),
      discountRate: "0",
      batchId: null,
      subtotal: 0,
      taxAmount: 0,
      total: 0,
    };
    setItems((prev) => [...prev, recalcItem(newItem, form.taxMethod)]);
    setProductPicker("");
  };

  // 切客戶：confirm 是否以新客戶類型重算所有品項單價
  const changeCustomer = (newCustomerId: string) => {
    if (items.length > 0 && form.customerId && form.customerId !== newCustomerId && newCustomerId) {
      const cust = customers.find((c) => c.id === newCustomerId);
      const tierName =
        cust?.customerType === "wholesale" ? "批發價" : cust?.customerType === "dealer" ? "團購價" : "零售價";
      if (
        confirm(
          `要把所有品項的單價更新為新客戶適用的「${tierName}」嗎？\n\n按確定 = 全部重算（會覆寫你手動改過的單價）\n按取消 = 只換客戶，保留現有單價`
        )
      ) {
        setItems((prev) =>
          prev.map((item) => {
            const p = products.find((pp) => pp.id === item.productId);
            if (!p) return item;
            return recalcItem({ ...item, unitPrice: String(pickPrice(p, cust?.customerType)) }, form.taxMethod);
          })
        );
      }
    }
    setForm((f) => ({ ...f, customerId: newCustomerId }));
  };

  const updateItem = (index: number, field: "quantity" | "unitPrice" | "discountRate", value: string) => {
    setItems((prev) => prev.map((item, i) => (i === index ? recalcItem({ ...item, [field]: value }, form.taxMethod) : item)));
  };

  const changeTaxMethod = (taxMethod: string) => {
    setForm((f) => ({ ...f, taxMethod }));
    setItems((prev) => prev.map((item) => recalcItem(item, taxMethod)));
  };

  // 批號下拉：出貨倉的批排前面，其他倉的標示「非出貨倉」
  const batchesForProduct = (productId: string): Batch[] => {
    const all = batches.filter((b) => b.productId === productId);
    if (!form.warehouseId) return all;
    return [
      ...all.filter((b) => b.warehouseId === form.warehouseId),
      ...all.filter((b) => b.warehouseId !== form.warehouseId),
    ];
  };

  const totals = items.reduce(
    (acc, i) => ({ subtotal: acc.subtotal + i.subtotal, tax: acc.tax + i.taxAmount, total: acc.total + i.total }),
    { subtotal: 0, tax: 0, total: 0 }
  );
  const availableProducts = products.filter((p) => !items.some((i) => i.productId === p.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId) { setError("請選擇客戶"); return; }
    if (!form.warehouseId) { setError("請選擇出貨倉庫"); return; }
    if (items.length === 0) { setError("請至少加入一項商品"); return; }
    for (const item of items) {
      if (parseNum(item.quantity) <= 0) { setError(`「${item.productName}」的數量需大於 0`); return; }
      if (parseNum(item.unitPrice) < 0) { setError(`「${item.productName}」的單價不可為負`); return; }
    }
    setSaving(true);
    setError("");

    const res = await fetch("/api/admin/erp/sales-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        items: items.map((item) => {
          const p = products.find((pp) => pp.id === item.productId);
          return {
            productId: item.productId,
            batchId: item.batchId,
            quantity: parseNum(item.quantity),
            unitPrice: parseNum(item.unitPrice),
            discountRate: parseNum(item.discountRate),
            priceTier: p ? priceTier(parseNum(item.unitPrice), p).key : null,
          };
        }),
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "建立失敗");
      setSaving(false);
      return;
    }
    router.push("/admin/erp/sales-orders");
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">載入中...</div>;
  }

  const soonThreshold = new Date();
  soonThreshold.setDate(soonThreshold.getDate() + 30);

  return (
    <div className="pb-28">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/erp/sales-orders" className="text-sm text-gray-500 hover:text-gray-700">
          ← 返回列表
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">新增銷售訂單</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本資訊 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">基本資訊</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">客戶 *</label>
              <select
                required
                value={form.customerId}
                onChange={(e) => changeCustomer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選擇客戶（類型決定帶價）</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName}（{typeLabel[c.customerType] || c.customerType}）
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">出貨倉庫 *</label>
              <select
                required
                value={form.warehouseId}
                onChange={(e) => setForm((f) => ({ ...f, warehouseId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選擇出貨倉</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.code} {w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">訂單日期</label>
              <input
                type="date"
                value={form.orderDate}
                onChange={(e) => setForm((f) => ({ ...f, orderDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">預計出貨日</label>
              <input
                type="date"
                value={form.expectedShipDate}
                onChange={(e) => setForm((f) => ({ ...f, expectedShipDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">稅額計算</label>
              <select
                value={form.taxMethod}
                onChange={(e) => changeTaxMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tax_excluded">稅外加（未稅）</option>
                <option value="tax_included">含稅</option>
              </select>
            </div>
          </div>
        </div>

        {/* 訂單品項 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <h2 className="text-base font-semibold text-gray-900">訂單品項</h2>
            <div className="flex gap-2">
              <select
                value={productPicker}
                onChange={(e) => setProductPicker(e.target.value)}
                className="min-w-[280px] px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選擇商品加入...</option>
                {availableProducts.map((p) => {
                  const selling = Number(p.sellingPrice);
                  const w = Number(p.wholesalePrice) || selling;
                  const g = Number(p.groupPrice) || selling;
                  return (
                    <option key={p.id} value={p.id}>
                      {p.sku} — {p.name}（零售 ${selling.toLocaleString()} · 批發 ${w.toLocaleString()} · 團購 ${g.toLocaleString()}）
                    </option>
                  );
                })}
              </select>
              <button
                type="button"
                onClick={() => { if (productPicker) addItem(productPicker); }}
                disabled={!productPicker}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                + 加入
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-100 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500 bg-gray-50">
                  <th className="px-3 py-2.5 font-medium w-24">品號</th>
                  <th className="px-3 py-2.5 font-medium min-w-[140px]">品名</th>
                  <th className="px-3 py-2.5 font-medium w-56">批號（依效期排）</th>
                  <th className="px-3 py-2.5 font-medium w-14 text-center">單位</th>
                  <th className="px-3 py-2.5 font-medium w-20 text-center">數量</th>
                  <th className="px-3 py-2.5 font-medium w-32 text-center">單價</th>
                  <th className="px-3 py-2.5 font-medium w-20 text-center">折扣 %</th>
                  <th className="px-3 py-2.5 font-medium w-24 text-right">小計</th>
                  <th className="px-3 py-2.5 font-medium w-20 text-right">稅額</th>
                  <th className="px-3 py-2.5 font-medium w-28 text-right">合計</th>
                  <th className="px-3 py-2.5 w-12" />
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-10 text-gray-400">請從上方選擇商品加入</td>
                  </tr>
                ) : (
                  items.map((item, idx) => {
                    const rowBatches = batchesForProduct(item.productId);
                    const p = products.find((pp) => pp.id === item.productId);
                    const tier = p ? priceTier(parseNum(item.unitPrice), p) : null;
                    return (
                      <tr key={item.productId} className="border-b border-gray-50">
                        <td className="px-3 py-2 font-mono text-gray-600">{item.sku}</td>
                        <td className="px-3 py-2 font-medium text-gray-900">{item.productName}</td>
                        <td className="px-3 py-2">
                          {rowBatches.length === 0 ? (
                            <span className="text-xs text-gray-400">無批號資料</span>
                          ) : (
                            <select
                              value={item.batchId ?? ""}
                              onChange={(e) =>
                                setItems((prev) =>
                                  prev.map((it, i) => (i === idx ? { ...it, batchId: e.target.value || null } : it))
                                )
                              }
                              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">不指定（出貨時決定）</option>
                              {rowBatches.map((b) => {
                                const soon = b.expiryDate && new Date(b.expiryDate) <= soonThreshold;
                                const inWh = !form.warehouseId || b.warehouseId === form.warehouseId;
                                return (
                                  <option key={b.id} value={b.id}>
                                    {b.batchNo} · {b.expiryDate ?? "無效期"} · 剩 {b.quantity}
                                    {b.warehouseName ? ` · ${b.warehouseName}` : ""}
                                    {soon ? " ⚠ 近效期" : ""}
                                    {inWh ? "" : "（非出貨倉）"}
                                  </option>
                                );
                              })}
                            </select>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center text-gray-500">{item.unit}</td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min={0}
                            step="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {tier && (
                            <div className={`mt-0.5 text-center text-[10px] font-medium ${tier.color}`}>🏷 {tier.label}</div>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step="0.1"
                            value={item.discountRate}
                            onChange={(e) => updateItem(idx, "discountRate", e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">{item.subtotal.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-gray-500">{item.taxAmount.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right font-semibold tabular-nums">{item.total.toLocaleString()}</td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700"
                            title="移除品項"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 地址與備註 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">送貨地址</label>
            <textarea
              rows={3}
              value={form.shippingAddress}
              onChange={(e) => setForm((f) => ({ ...f, shippingAddress: e.target.value }))}
              placeholder="出貨時會帶入；可在出貨單覆寫"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
            <textarea
              rows={3}
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="內部備註"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* 底部固定合計列 */}
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur px-6 py-4 shadow-[0_-4px_12px_-6px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between gap-6 flex-wrap max-w-7xl mx-auto">
            <div className="flex items-center gap-6 flex-wrap text-sm">
              <div>
                <div className="text-gray-500">未稅小計</div>
                <div className="text-lg font-semibold tabular-nums">{totals.subtotal.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-500">稅額</div>
                <div className="text-lg font-semibold tabular-nums">{totals.tax.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-500">總金額</div>
                <div className="text-2xl font-bold tabular-nums text-blue-600">{totals.total.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/admin/erp/sales-orders"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "儲存中..." : "建立銷售訂單"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
