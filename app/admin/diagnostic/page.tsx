"use client";

import { useState, useEffect } from "react";

interface TokenRecord {
  id: string;
  token: string;
  email: string;
  contactName: string | null;
  status: string;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  note: string | null;
}

export default function AdminDiagnosticPage() {
  const [tokens, setTokens] = useState<TokenRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: "", contactName: "", note: "" });
  const [creating, setCreating] = useState(false);
  const [newTokenUrl, setNewTokenUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/diagnostic-tokens");
      if (res.ok) setTokens(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTokens(); }, []);

  const handleCreate = async () => {
    if (!form.email) return;
    setCreating(true);
    try {
      const res = await fetch("/api/diagnostic/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setNewTokenUrl(data.url);
        setForm({ email: "", contactName: "", note: "" });
        setShowForm(false);
        await fetchTokens();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusBadge = (status: string) => {
    const styles = {
      unused: "bg-green-100 text-green-700",
      used: "bg-gray-100 text-gray-600",
      expired: "bg-red-100 text-red-600",
    };
    const labels = { unused: "未使用", used: "已使用", expired: "已過期" };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-600"}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://huibang.com.tw";

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">深度健診管理</h1>
          <p className="text-gray-500 text-sm mt-1">管理 AI 社群帳號健診（$999）的 Token 連結</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setNewTokenUrl(null); }}
          className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
        >
          ＋ 產生健診連結
        </button>
      </div>

      {/* 產生 Token 表單 */}
      {showForm && (
        <div className="mb-6 p-6 bg-indigo-50 border border-indigo-200 rounded-2xl">
          <h2 className="font-bold text-gray-900 mb-4">產生新的健診連結</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                客戶 Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="client@example.com"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">聯絡人姓名</label>
              <input
                type="text"
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                placeholder="王小明"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">備註（選填，例如：ECPay 訂單編號）</label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="例如：ECPay#20260305001"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={!form.email || creating}
              className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {creating ? "產生中..." : "產生連結"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2.5 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:border-gray-300 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 新產生的 Token URL */}
      {newTokenUrl && (
        <div className="mb-6 p-5 bg-green-50 border-2 border-green-300 rounded-2xl">
          <p className="font-bold text-green-700 mb-3">✅ 連結已產生！複製後傳給客戶</p>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newTokenUrl}
              readOnly
              className="flex-1 px-4 py-2.5 bg-white border border-green-200 rounded-xl text-sm font-mono text-gray-600"
            />
            <button
              onClick={() => handleCopy(newTokenUrl)}
              className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors whitespace-nowrap"
            >
              {copied ? "✅ 已複製" : "複製連結"}
            </button>
          </div>
          <p className="text-green-600 text-xs mt-2">此連結有效期 30 天，使用一次後失效</p>
        </div>
      )}

      {/* Token 列表 */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">載入中...</div>
      ) : tokens.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">🔑</p>
          <p>尚未產生任何健診連結</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">聯絡人</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">狀態</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">產生時間</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">備註</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tokens.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{t.contactName || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.email}</td>
                  <td className="px-4 py-3">{statusBadge(t.status)}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(t.createdAt).toLocaleDateString("zh-TW")}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{t.note || "—"}</td>
                  <td className="px-4 py-3">
                    {t.status === "unused" && (
                      <button
                        onClick={() => handleCopy(`${baseUrl}/diagnostic?token=${t.token}`)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        複製連結
                      </button>
                    )}
                    {t.status === "used" && t.submissionId && (
                      <a
                        href={`/diagnostic/result/${t.submissionId}`}
                        target="_blank"
                        className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                        rel="noreferrer"
                      >
                        查看報告
                      </a>
                    )}
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
