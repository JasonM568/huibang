"use client";

import { useEffect, useState, useCallback } from "react";

interface LedgerEntry {
  id: string;
  type: string;
  description: string;
  amount: string;
  counterparty: string | null;
  invoiceNo: string | null;
  invoiceDate: string | null;
  paymentStatus: string;
  transactionDate: string | null;
  note: string | null;
  createdAt: string;
}

const statusMap: Record<string, { label: string; color: string }> = {
  paid: { label: "已付", color: "bg-green-100 text-green-700" },
  pending_pay: { label: "待付", color: "bg-yellow-100 text-yellow-700" },
  received: { label: "已收", color: "bg-blue-100 text-blue-700" },
  pending_receive: { label: "待收", color: "bg-orange-100 text-orange-700" },
};

const typeMap: Record<string, string> = {
  payable: "應付帳款",
  receivable: "應收帳款",
};

const emptyForm = {
  type: "payable" as string,
  description: "",
  amount: "",
  counterparty: "",
  invoiceNo: "",
  invoiceDate: "",
  paymentStatus: "pending_pay",
  transactionDate: "",
  note: "",
};

export default function LedgerTab() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Modal
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterType) params.set("type", filterType);
    if (filterStatus) params.set("status", filterStatus);
    const res = await fetch(`/api/admin/ledger?${params}`);
    const data = await res.json();
    setEntries(data.data || []);
    setLoading(false);
  }, [filterType, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (e: LedgerEntry) => {
    setForm({
      type: e.type,
      description: e.description,
      amount: e.amount,
      counterparty: e.counterparty || "",
      invoiceNo: e.invoiceNo || "",
      invoiceDate: e.invoiceDate ? e.invoiceDate.slice(0, 10) : "",
      paymentStatus: e.paymentStatus,
      transactionDate: e.transactionDate ? e.transactionDate.slice(0, 16) : "",
      note: e.note || "",
    });
    setEditingId(e.id);
    setShowForm(true);
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSaving(true);
    const url = editingId ? `/api/admin/ledger/${editingId}` : "/api/admin/ledger";
    const method = editingId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      resetForm();
      fetchData();
    } else {
      const data = await res.json();
      alert(data.error || "操作失敗");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此筆記錄？")) return;
    await fetch(`/api/admin/ledger/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleTypeChange = (type: string) => {
    setForm({
      ...form,
      type,
      paymentStatus: type === "payable" ? "pending_pay" : "pending_receive",
    });
  };

  const fmt = (d: string | null) => {
    if (!d) return "—";
    const date = new Date(d);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;
  };

  const fmtDateTime = (d: string | null) => {
    if (!d) return "—";
    const date = new Date(d);
    return `${fmt(d)} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  // 統計
  const totalPayable = entries.filter(e => e.type === "payable").reduce((s, e) => s + Number(e.amount), 0);
  const totalReceivable = entries.filter(e => e.type === "receivable").reduce((s, e) => s + Number(e.amount), 0);
  const pendingPay = entries.filter(e => e.paymentStatus === "pending_pay").reduce((s, e) => s + Number(e.amount), 0);
  const pendingReceive = entries.filter(e => e.paymentStatus === "pending_receive").reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div>
      {/* 統計卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-red-50 rounded-lg p-3">
          <p className="text-xs text-red-600">應付總額</p>
          <p className="text-lg font-bold text-red-700">${totalPayable.toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-blue-600">應收總額</p>
          <p className="text-lg font-bold text-blue-700">${totalReceivable.toLocaleString()}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3">
          <p className="text-xs text-yellow-600">待付金額</p>
          <p className="text-lg font-bold text-yellow-700">${pendingPay.toLocaleString()}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-3">
          <p className="text-xs text-orange-600">待收金額</p>
          <p className="text-lg font-bold text-orange-700">${pendingReceive.toLocaleString()}</p>
        </div>
      </div>

      {/* 篩選 + 新增 */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex gap-2">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">全部類型</option>
            <option value="payable">應付帳款</option>
            <option value="receivable">應收帳款</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">全部狀態</option>
            <option value="paid">已付</option>
            <option value="pending_pay">待付</option>
            <option value="received">已收</option>
            <option value="pending_receive">待收</option>
          </select>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          + 新增帳款
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">{editingId ? "編輯帳款" : "新增帳款"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">類型 *</label>
                  <select required value={form.type} onChange={(e) => handleTypeChange(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="payable">應付帳款</option>
                    <option value="receivable">應收帳款</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">金額 *</label>
                  <input required type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">款項說明 *</label>
                <input required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">對象（公司/個人）</label>
                <input value={form.counterparty} onChange={(e) => setForm({ ...form, counterparty: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">發票號碼</label>
                  <input value={form.invoiceNo} onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">發票開立日期</label>
                  <input type="date" value={form.invoiceDate} onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">付款狀態</label>
                  <select value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    {form.type === "payable" ? (
                      <>
                        <option value="pending_pay">待付</option>
                        <option value="paid">已付</option>
                      </>
                    ) : (
                      <>
                        <option value="pending_receive">待收</option>
                        <option value="received">已收</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">出入帳日期時間</label>
                  <input type="datetime-local" value={form.transactionDate} onChange={(e) => setForm({ ...form, transactionDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
                <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {saving ? "儲存中..." : editingId ? "儲存" : "新增"}
                </button>
                <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">取消</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">載入中...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-gray-400">尚無收支記錄</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">類型</th>
                <th className="px-4 py-3 font-medium">款項說明</th>
                <th className="px-4 py-3 font-medium">對象</th>
                <th className="px-4 py-3 font-medium text-right">金額</th>
                <th className="px-4 py-3 font-medium">發票號碼</th>
                <th className="px-4 py-3 font-medium">發票日期</th>
                <th className="px-4 py-3 font-medium">狀態</th>
                <th className="px-4 py-3 font-medium">出入帳時間</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const status = statusMap[e.paymentStatus] || { label: e.paymentStatus, color: "bg-gray-100 text-gray-700" };
                return (
                  <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${e.type === "payable" ? "text-red-600" : "text-blue-600"}`}>
                        {typeMap[e.type] || e.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{e.description}</td>
                    <td className="px-4 py-3 text-gray-600">{e.counterparty || "—"}</td>
                    <td className="px-4 py-3 text-right font-medium">${Number(e.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{e.invoiceNo || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{fmt(e.invoiceDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{fmtDateTime(e.transactionDate)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleEdit(e)} className="text-blue-600 hover:text-blue-800 mr-3">編輯</button>
                      <button onClick={() => handleDelete(e.id)} className="text-red-500 hover:text-red-700">刪除</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
