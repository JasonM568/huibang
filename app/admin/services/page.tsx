"use client";

import { useEffect, useState } from "react";

interface Service {
  id: string;
  name: string;
  specification: string | null;
  unitPrice: string;
  description: string | null;
  isActive: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    specification: "",
    unitPrice: "",
    description: "",
  });

  const fetchServices = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/services?all=1");
    const data = await res.json();
    setServices(data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const resetForm = () => {
    setForm({ name: "", specification: "", unitPrice: "", description: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await fetch(`/api/admin/services/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    resetForm();
    fetchServices();
  };

  const handleEdit = (s: Service) => {
    setForm({
      name: s.name,
      specification: s.specification || "",
      unitPrice: s.unitPrice,
      description: s.description || "",
    });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此服務項目？")) return;
    await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    fetchServices();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">服務項目</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + 新增服務
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold mb-4">
              {editingId ? "編輯服務" : "新增服務"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">服務名稱 *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">規格說明</label>
                <input
                  value={form.specification}
                  onChange={(e) => setForm({ ...form, specification: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">單價 *</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={form.unitPrice}
                  onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
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
      ) : services.length === 0 ? (
        <div className="text-center py-12 text-gray-400">尚無服務項目</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">名稱</th>
                <th className="px-4 py-3 font-medium">規格</th>
                <th className="px-4 py-3 font-medium text-right">單價</th>
                <th className="px-4 py-3 font-medium">備註</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.specification || "-"}</td>
                  <td className="px-4 py-3 text-gray-900 text-right">
                    ${Number(s.unitPrice).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.description || "-"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleEdit(s)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      編輯
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      刪除
                    </button>
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
