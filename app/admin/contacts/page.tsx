"use client";

import { useState, useEffect, useCallback } from "react";

interface Contact {
  id: string;
  createdAt: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  service: string | null;
  message: string;
  status: string;
  internalNote: string | null;
}

const statusMap: Record<string, { label: string; color: string }> = {
  unread: { label: "未讀", color: "bg-red-100 text-red-700" },
  read: { label: "已讀", color: "bg-yellow-100 text-yellow-700" },
  replied: { label: "已回覆", color: "bg-green-100 text-green-700" },
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    try {
      const res = await fetch(`/api/admin/contacts?${params}`);
      const data = await res.json();
      setContacts(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStatus = async (id: string, newStatus: string) => {
    setSaving(true);
    try {
      await fetch("/api/admin/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const saveNote = async (id: string) => {
    setSaving(true);
    try {
      await fetch("/api/admin/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, internalNote: note }),
      });
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, internalNote: note } : c))
      );
      setSelectedId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  const selected = contacts.find((c) => c.id === selectedId);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">聯絡表單</h1>
          <p className="text-sm text-gray-500 mt-1">
            共 {contacts.length} 筆訊息
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">全部狀態</option>
          <option value="unread">未讀</option>
          <option value="read">已讀</option>
          <option value="replied">已回覆</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-4xl mb-3">📭</div>
                <p>沒有聯絡訊息</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
                {contacts.map((c) => {
                  const st = statusMap[c.status] || { label: c.status, color: "bg-gray-100 text-gray-700" };
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedId(c.id);
                        setNote(c.internalNote || "");
                        if (c.status === "unread") updateStatus(c.id, "read");
                      }}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                        selectedId === c.id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 text-sm">{c.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>
                          {st.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{c.company || "—"} · {c.service || "未選"}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{c.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(c.createdAt)}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selected.name}</h2>
                  <p className="text-sm text-gray-500">{selected.company || "未填公司"}</p>
                </div>
                <select
                  value={selected.status}
                  onChange={(e) => updateStatus(selected.id, e.target.value)}
                  disabled={saving}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="unread">未讀</option>
                  <option value="read">已讀</option>
                  <option value="replied">已回覆</option>
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <span className="text-gray-400">Email</span>
                  <p className="font-medium">
                    <a href={`mailto:${selected.email}`} className="text-blue-600 hover:underline">
                      {selected.email}
                    </a>
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">電話</span>
                  <p className="font-medium">
                    {selected.phone ? (
                      <a href={`tel:${selected.phone}`} className="text-blue-600 hover:underline">
                        {selected.phone}
                      </a>
                    ) : "未填"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">感興趣服務</span>
                  <p className="font-medium">{selected.service || "未選"}</p>
                </div>
                <div>
                  <span className="text-gray-400">時間</span>
                  <p className="font-medium">{new Date(selected.createdAt).toLocaleString("zh-TW")}</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-sm text-gray-400">留言內容</span>
                <div className="mt-1 p-4 bg-gray-50 rounded-lg text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {selected.message}
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-400">內部備註</span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="輸入備註..."
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => saveNote(selected.id)}
                  disabled={saving}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "儲存中..." : "儲存備註"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 flex items-center justify-center h-96 text-gray-400">
              <div className="text-center">
                <p className="text-4xl mb-3">👈</p>
                <p>選擇一則訊息查看詳情</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
