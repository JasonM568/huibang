"use client";

import { useEffect, useState } from "react";

interface SpecRow {
  dimensionId: string;
  dimensionName: string;
  optionId: string;
  optionValue: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  specification: string | null;
  unit: string;
  categoryId: string | null;
  categoryName: string | null;
  barcode: string | null;
  costPrice: string;
  sellingPrice: string;
  wholesalePrice: string;
  groupPrice: string;
  safetyStock: number;
  hasExpiry: boolean;
  expiryAlertDays: number;
  isActive: boolean;
  totalQuantity: number;
  specs: SpecRow[];
}

interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

interface Dimension {
  id: string;
  name: string;
  isActive: boolean;
  options: { id: string; value: string; isActive: boolean }[];
}

const emptyForm = {
  sku: "",
  name: "",
  specification: "",
  unit: "個",
  categoryId: "",
  barcode: "",
  costPrice: "",
  sellingPrice: "",
  wholesalePrice: "",
  groupPrice: "",
  safetyStock: "0",
  hasExpiry: true,
  expiryAlertDays: "30",
};

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  // 每維度選一個選項：{ dimensionId: optionId }
  const [specSelections, setSpecSelections] = useState<Record<string, string>>({});

  const fetchProducts = async (keyword = "") => {
    setLoading(true);
    const params = keyword ? `?search=${encodeURIComponent(keyword)}` : "";
    const res = await fetch(`/api/admin/erp/products${params}`);
    const data = await res.json();
    setProducts(data.data || []);
    setLoading(false);
  };

  const fetchMeta = async () => {
    const [catRes, dimRes] = await Promise.all([
      fetch("/api/admin/erp/categories"),
      fetch("/api/admin/erp/specs/dimensions"),
    ]);
    const catData = await catRes.json();
    const dimData = await dimRes.json();
    setCategories((catData.data || []).filter((c: Category) => c.isActive));
    setDimensions((dimData.data || []).filter((d: Dimension) => d.isActive));
  };

  useEffect(() => {
    fetchProducts();
    fetchMeta();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(search);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setSpecSelections({});
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      sku: form.sku,
      name: form.name,
      specification: form.specification,
      unit: form.unit,
      categoryId: form.categoryId || null,
      barcode: form.barcode,
      costPrice: Number(form.costPrice) || 0,
      sellingPrice: Number(form.sellingPrice) || 0,
      wholesalePrice: Number(form.wholesalePrice) || 0,
      groupPrice: Number(form.groupPrice) || 0,
      safetyStock: Number(form.safetyStock) || 0,
      hasExpiry: form.hasExpiry,
      expiryAlertDays: Number(form.expiryAlertDays) || 0,
      specs: Object.entries(specSelections)
        .filter(([, optionId]) => optionId)
        .map(([dimensionId, optionId]) => ({ dimensionId, optionId })),
    };
    const res = editingId
      ? await fetch(`/api/admin/erp/products/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/admin/erp/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "儲存失敗");
      return;
    }
    resetForm();
    fetchProducts(search);
  };

  const handleEdit = (p: Product) => {
    setForm({
      sku: p.sku,
      name: p.name,
      specification: p.specification || "",
      unit: p.unit,
      categoryId: p.categoryId || "",
      barcode: p.barcode || "",
      costPrice: p.costPrice,
      sellingPrice: p.sellingPrice,
      wholesalePrice: p.wholesalePrice,
      groupPrice: p.groupPrice,
      safetyStock: String(p.safetyStock),
      hasExpiry: p.hasExpiry,
      expiryAlertDays: String(p.expiryAlertDays),
    });
    const selections: Record<string, string> = {};
    for (const s of p.specs) selections[s.dimensionId] = s.optionId;
    setSpecSelections(selections);
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleToggleActive = async (p: Product) => {
    await fetch(`/api/admin/erp/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    fetchProducts(search);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此商品？（已有庫存或單據紀錄的商品無法刪除）")) return;
    const res = await fetch(`/api/admin/erp/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "刪除失敗");
      return;
    }
    fetchProducts(search);
  };

  const fmtPrice = (v: string) => `$${Number(v).toLocaleString()}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋 SKU / 品名 / 條碼"
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
          >
            搜尋
          </button>
        </form>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + 新增商品
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">{editingId ? "編輯商品" : "新增商品"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                  <input
                    required
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">品名 *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分類</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">未分類</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">單位</label>
                  <input
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    placeholder="個 / 箱 / 公斤"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">條碼</label>
                  <input
                    value={form.barcode}
                    onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">安全庫存</label>
                  <input
                    type="number"
                    min="0"
                    value={form.safetyStock}
                    onChange={(e) => setForm({ ...form, safetyStock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 價格 */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">成本價</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.costPrice}
                    onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">零售價</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.sellingPrice}
                    onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">批發價</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.wholesalePrice}
                    onChange={(e) => setForm({ ...form, wholesalePrice: e.target.value })}
                    placeholder="0 = 沿用零售價"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-1">團購價</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.groupPrice}
                    onChange={(e) => setForm({ ...form, groupPrice: e.target.value })}
                    placeholder="0 = 沿用零售價"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 結構化規格 */}
              {dimensions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">規格</label>
                  <div className="grid grid-cols-3 gap-3">
                    {dimensions.map((d) => (
                      <div key={d.id}>
                        <label className="block text-xs text-gray-500 mb-1">{d.name}</label>
                        <select
                          value={specSelections[d.id] || ""}
                          onChange={(e) =>
                            setSpecSelections({ ...specSelections, [d.id]: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">不指定</option>
                          {d.options.filter((o) => o.isActive).map((o) => (
                            <option key={o.id} value={o.id}>{o.value}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">補充說明</label>
                <input
                  value={form.specification}
                  onChange={(e) => setForm({ ...form, specification: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 效期屬性 */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.hasExpiry}
                    onChange={(e) => setForm({ ...form, hasExpiry: e.target.checked })}
                    className="rounded"
                  />
                  有效期商品（分配入倉必須選批號）
                </label>
                {form.hasExpiry && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    效期警示
                    <input
                      type="number"
                      min="0"
                      value={form.expiryAlertDays}
                      onChange={(e) => setForm({ ...form, expiryAlertDays: e.target.value })}
                      className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    天前（0 = 不警示）
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "儲存中..." : editingId ? "儲存" : "新增"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">載入中...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-400">尚無商品</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">品名</th>
                <th className="px-4 py-3 font-medium">分類</th>
                <th className="px-4 py-3 font-medium">規格</th>
                <th className="px-4 py-3 font-medium text-right">零售價</th>
                <th className="px-4 py-3 font-medium text-right">批發價</th>
                <th className="px-4 py-3 font-medium text-right">團購價</th>
                <th className="px-4 py-3 font-medium text-right">庫存</th>
                <th className="px-4 py-3 font-medium">效期</th>
                <th className="px-4 py-3 font-medium">狀態</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50 ${!p.isActive ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 font-mono text-gray-600">{p.sku}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {p.name}
                    {p.specification && (
                      <span className="block text-xs text-gray-400">{p.specification}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.categoryName || "-"}</td>
                  <td className="px-4 py-3">
                    {p.specs.length === 0 ? (
                      <span className="text-gray-400">-</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {p.specs.map((s) => (
                          <span
                            key={s.dimensionId}
                            className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            {s.dimensionName}:{s.optionValue}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-green-700">{fmtPrice(p.sellingPrice)}</td>
                  <td className="px-4 py-3 text-right text-blue-700">
                    {Number(p.wholesalePrice) > 0 ? fmtPrice(p.wholesalePrice) : <span className="text-gray-400">沿用零售</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-purple-700">
                    {Number(p.groupPrice) > 0 ? fmtPrice(p.groupPrice) : <span className="text-gray-400">沿用零售</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={p.totalQuantity <= p.safetyStock ? "text-red-600 font-medium" : "text-gray-900"}>
                      {p.totalQuantity}
                    </span>
                    <span className="text-gray-400"> {p.unit}</span>
                  </td>
                  <td className="px-4 py-3">
                    {p.hasExpiry ? (
                      <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-xs">
                        效期 {p.expiryAlertDays}天
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">無效期</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(p)}
                      className={`px-1.5 py-0.5 rounded text-xs ${
                        p.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {p.isActive ? "販售中" : "停用"}
                    </button>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-800 mr-3">編輯</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700">刪除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
