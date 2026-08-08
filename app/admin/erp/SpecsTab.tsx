"use client";

import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface SpecOption {
  id: string;
  value: string;
  sortOrder: number;
  isActive: boolean;
}

interface Dimension {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  options: SpecOption[];
}

export default function SpecsTab() {
  // ===== 分類 =====
  const [categories, setCategories] = useState<Category[]>([]);
  const [catForm, setCatForm] = useState({ name: "", parentId: "" });
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [showCatForm, setShowCatForm] = useState(false);

  // ===== 規格維度/選項 =====
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [newDimName, setNewDimName] = useState("");
  // 各維度的新選項輸入框
  const [newOptionValues, setNewOptionValues] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    const [catRes, dimRes] = await Promise.all([
      fetch("/api/admin/erp/categories"),
      fetch("/api/admin/erp/specs/dimensions"),
    ]);
    const catData = await catRes.json();
    const dimData = await dimRes.json();
    setCategories(catData.data || []);
    setDimensions(dimData.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ===== 分類操作 =====
  const resetCatForm = () => {
    setCatForm({ name: "", parentId: "" });
    setEditingCatId(null);
    setShowCatForm(false);
  };

  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: catForm.name, parentId: catForm.parentId || null };
    const res = editingCatId
      ? await fetch(`/api/admin/erp/categories/${editingCatId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/admin/erp/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "儲存失敗");
      return;
    }
    resetCatForm();
    fetchAll();
  };

  const handleCatDelete = async (id: string) => {
    if (!confirm("確定要刪除此分類？")) return;
    const res = await fetch(`/api/admin/erp/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "刪除失敗");
      return;
    }
    fetchAll();
  };

  // ===== 規格操作 =====
  const handleAddDimension = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDimName.trim()) return;
    const res = await fetch("/api/admin/erp/specs/dimensions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newDimName.trim(), sortOrder: dimensions.length + 1 }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "新增失敗");
      return;
    }
    setNewDimName("");
    fetchAll();
  };

  const handleDeleteDimension = async (d: Dimension) => {
    if (!confirm(`確定要刪除維度「${d.name}」？底下 ${d.options.length} 個選項與商品的此規格會一併移除。`)) return;
    await fetch(`/api/admin/erp/specs/dimensions/${d.id}`, { method: "DELETE" });
    fetchAll();
  };

  const handleAddOption = async (dimensionId: string) => {
    const value = (newOptionValues[dimensionId] || "").trim();
    if (!value) return;
    const dim = dimensions.find((d) => d.id === dimensionId);
    const res = await fetch("/api/admin/erp/specs/options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dimensionId, value, sortOrder: (dim?.options.length || 0) + 1 }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "新增失敗");
      return;
    }
    setNewOptionValues({ ...newOptionValues, [dimensionId]: "" });
    fetchAll();
  };

  const handleDeleteOption = async (option: SpecOption) => {
    if (!confirm(`確定要刪除選項「${option.value}」？使用此選項的商品規格會一併移除。`)) return;
    await fetch(`/api/admin/erp/specs/options/${option.id}`, { method: "DELETE" });
    fetchAll();
  };

  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name || "-";

  if (loading) {
    return <div className="text-center py-12 text-gray-400">載入中...</div>;
  }

  return (
    <div className="space-y-8">
      {/* ===== 分類管理 ===== */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">商品分類</h2>
          <button
            onClick={() => { resetCatForm(); setShowCatForm(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + 新增分類
          </button>
        </div>

        {showCatForm && (
          <form onSubmit={handleCatSubmit} className="bg-gray-50 rounded-xl p-4 mb-4 flex items-end gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分類名稱 *</label>
              <input
                required
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">上層分類</label>
              <select
                value={catForm.parentId}
                onChange={(e) => setCatForm({ ...catForm, parentId: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">無（頂層）</option>
                {categories
                  .filter((c) => c.id !== editingCatId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              {editingCatId ? "儲存" : "新增"}
            </button>
            <button
              type="button"
              onClick={resetCatForm}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              取消
            </button>
          </form>
        )}

        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-white rounded-xl border border-gray-200">尚無分類</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">名稱</th>
                  <th className="px-4 py-3 font-medium">上層分類</th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.parentId ? catName(c.parentId) : "-"}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setCatForm({ name: c.name, parentId: c.parentId || "" });
                          setEditingCatId(c.id);
                          setShowCatForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        編輯
                      </button>
                      <button onClick={() => handleCatDelete(c.id)} className="text-red-500 hover:text-red-700">
                        刪除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ===== 規格維度/選項 ===== */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">規格維度與選項</h2>
          <form onSubmit={handleAddDimension} className="flex gap-2">
            <input
              value={newDimName}
              onChange={(e) => setNewDimName(e.target.value)}
              placeholder="新維度名稱（如：口味）"
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              + 新增維度
            </button>
          </form>
        </div>

        {dimensions.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-white rounded-xl border border-gray-200">尚無規格維度</div>
        ) : (
          <div className="space-y-4">
            {dimensions.map((d) => (
              <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{d.name}</h3>
                  <button
                    onClick={() => handleDeleteDimension(d)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    刪除維度
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {d.options.map((o) => (
                    <span
                      key={o.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {o.value}
                      <button
                        onClick={() => handleDeleteOption(o)}
                        className="text-gray-400 hover:text-red-500 leading-none"
                        title="刪除選項"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    value={newOptionValues[d.id] || ""}
                    onChange={(e) => setNewOptionValues({ ...newOptionValues, [d.id]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddOption(d.id);
                      }
                    }}
                    placeholder="+ 新選項（Enter）"
                    className="px-2.5 py-1 border border-dashed border-gray-300 rounded-full text-sm w-36 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
