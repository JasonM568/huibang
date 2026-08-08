"use client";

import { useEffect, useState } from "react";

interface Warehouse {
  id: string;
  code: string;
  name: string;
  warehouseType: string; // main | sub
  parentId: string | null;
  address: string | null;
  isActive: boolean;
}

const emptyForm = {
  code: "",
  name: "",
  warehouseType: "main",
  parentId: "",
  address: "",
};

export default function WarehousesTab() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchWarehouses = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/erp/warehouses");
    const data = await res.json();
    setWarehouses(data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: form.code,
      name: form.name,
      warehouseType: form.warehouseType,
      parentId: form.warehouseType === "sub" ? form.parentId || null : null,
      address: form.address,
    };
    if (form.warehouseType === "sub" && !payload.parentId) {
      alert("子倉必須指定所屬主倉");
      return;
    }
    const res = editingId
      ? await fetch(`/api/admin/erp/warehouses/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/admin/erp/warehouses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "儲存失敗");
      return;
    }
    resetForm();
    fetchWarehouses();
  };

  const handleEdit = (w: Warehouse) => {
    setForm({
      code: w.code,
      name: w.name,
      warehouseType: w.warehouseType,
      parentId: w.parentId || "",
      address: w.address || "",
    });
    setEditingId(w.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此倉庫？（已有庫存或單據的倉庫無法刪除）")) return;
    const res = await fetch(`/api/admin/erp/warehouses/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "刪除失敗");
      return;
    }
    fetchWarehouses();
  };

  const parentName = (id: string | null) => warehouses.find((w) => w.id === id)?.name || "-";
  const mainWarehouses = warehouses.filter((w) => w.warehouseType === "main" && w.id !== editingId);

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + 新增倉庫
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold mb-4">{editingId ? "編輯倉庫" : "新增倉庫"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">代號 *</label>
                  <input
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="如：WH01"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">名稱 *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">類型</label>
                  <select
                    value={form.warehouseType}
                    onChange={(e) => setForm({ ...form, warehouseType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="main">主倉</option>
                    <option value="sub">子倉</option>
                  </select>
                </div>
                {form.warehouseType === "sub" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">所屬主倉 *</label>
                    <select
                      required
                      value={form.parentId}
                      onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">請選擇</option>
                      {mainWarehouses.map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  {editingId ? "儲存" : "新增"}
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
      ) : warehouses.length === 0 ? (
        <div className="text-center py-12 text-gray-400">尚無倉庫</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">代號</th>
                <th className="px-4 py-3 font-medium">名稱</th>
                <th className="px-4 py-3 font-medium">類型</th>
                <th className="px-4 py-3 font-medium">所屬主倉</th>
                <th className="px-4 py-3 font-medium">地址</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((w) => (
                <tr key={w.id} className={`border-b border-gray-50 hover:bg-gray-50 ${!w.isActive ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 font-mono text-gray-600">{w.code}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{w.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs ${
                        w.warehouseType === "main"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {w.warehouseType === "main" ? "主倉" : "子倉"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {w.warehouseType === "sub" ? parentName(w.parentId) : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{w.address || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button onClick={() => handleEdit(w)} className="text-blue-600 hover:text-blue-800 mr-3">編輯</button>
                    <button onClick={() => handleDelete(w.id)} className="text-red-500 hover:text-red-700">刪除</button>
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
