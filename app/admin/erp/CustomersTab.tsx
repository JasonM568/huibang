"use client";

import { useEffect, useState } from "react";

interface ErpCustomer {
  id: string;
  code: string | null;
  companyName: string;
  taxId: string | null;
  customerType: string; // wholesale | dealer | retail
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  paymentTerms: string | null;
  note: string | null;
  isActive: boolean;
}

const typeMeta: Record<string, { label: string; desc: string; badge: string }> = {
  retail: { label: "零售", desc: "帶零售價", badge: "bg-green-50 text-green-700" },
  wholesale: { label: "批發", desc: "帶批發價", badge: "bg-blue-50 text-blue-700" },
  dealer: { label: "經銷", desc: "帶團購價", badge: "bg-purple-50 text-purple-700" },
};

const emptyForm = {
  code: "",
  companyName: "",
  taxId: "",
  customerType: "retail",
  contactName: "",
  phone: "",
  email: "",
  address: "",
  paymentTerms: "",
  note: "",
};

export default function CustomersTab() {
  const [customers, setCustomers] = useState<ErpCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchCustomers = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/erp/customers");
    const data = await res.json();
    setCustomers(data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = editingId
      ? await fetch(`/api/admin/erp/customers/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
      : await fetch("/api/admin/erp/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "儲存失敗");
      return;
    }
    resetForm();
    fetchCustomers();
  };

  const handleEdit = (c: ErpCustomer) => {
    setForm({
      code: c.code || "",
      companyName: c.companyName,
      taxId: c.taxId || "",
      customerType: c.customerType,
      contactName: c.contactName || "",
      phone: c.phone || "",
      email: c.email || "",
      address: c.address || "",
      paymentTerms: c.paymentTerms || "",
      note: c.note || "",
    });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此客戶？（已有訂單的客戶無法刪除）")) return;
    const res = await fetch(`/api/admin/erp/customers/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "刪除失敗");
      return;
    }
    fetchCustomers();
  };

  const toggleActive = async (c: ErpCustomer) => {
    const res = await fetch(`/api/admin/erp/customers/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    if (res.ok) fetchCustomers();
  };

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.companyName.toLowerCase().includes(q) ||
      (c.code || "").toLowerCase().includes(q) ||
      (c.contactName || "").toLowerCase().includes(q) ||
      (c.phone || "").includes(q)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜尋客戶名稱 / 代號 / 聯絡人 / 電話"
          className="w-72 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + 新增客戶
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">{editingId ? "編輯客戶" : "新增客戶"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* 客戶類型 radio card（決定建單帶價） */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">客戶類型（決定訂單自動帶價）</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["retail", "wholesale", "dealer"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, customerType: t })}
                      className={`border rounded-lg px-3 py-2.5 text-left transition-colors ${
                        form.customerType === t
                          ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900">{typeMeta[t].label}</div>
                      <div className="text-xs text-gray-500">{typeMeta[t].desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">客戶名稱 *</label>
                  <input
                    required
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">客戶代號</label>
                  <input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="選填，需唯一"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">統一編號</label>
                  <input
                    value={form.taxId}
                    onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">聯絡人</label>
                  <input
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">電話</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">付款條件</label>
                  <input
                    value={form.paymentTerms}
                    onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                    placeholder="如：月結 30 天"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
                  <input
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">{search ? "無符合的客戶" : "尚無客戶"}</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">代號</th>
                <th className="px-4 py-3 font-medium">客戶名稱</th>
                <th className="px-4 py-3 font-medium">類型</th>
                <th className="px-4 py-3 font-medium">聯絡人</th>
                <th className="px-4 py-3 font-medium">電話</th>
                <th className="px-4 py-3 font-medium">付款條件</th>
                <th className="px-4 py-3 font-medium">狀態</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className={`border-b border-gray-50 hover:bg-gray-50 ${!c.isActive ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 font-mono text-gray-600">{c.code || "-"}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{c.companyName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-1.5 py-0.5 rounded text-xs ${typeMeta[c.customerType]?.badge || "bg-gray-100 text-gray-600"}`}>
                      {typeMeta[c.customerType]?.label || c.customerType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.contactName || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{c.paymentTerms || "-"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(c)}
                      className={`px-1.5 py-0.5 rounded text-xs ${
                        c.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                      title="點擊切換啟用狀態"
                    >
                      {c.isActive ? "啟用" : "停用"}
                    </button>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button onClick={() => handleEdit(c)} className="text-blue-600 hover:text-blue-800 mr-3">編輯</button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700">刪除</button>
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
