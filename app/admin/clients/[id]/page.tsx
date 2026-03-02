"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

interface ClientStrategy {
  id: string;
  brandPersonality: string | null;
  brandTone: string | null;
  valueProposition: string | null;
  platforms: string | null;
  postFrequency: string | null;
}

interface ClientData {
  id: string;
  createdAt: string;
  updatedAt: string;
  brandName: string;
  industry: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  company: string | null;
  website: string | null;
  status: string;
  planTier: string | null;
  monthlyFee: number | null;
  contractStart: string | null;
  contractEnd: string | null;
  submissionId: string | null;
  assignedTo: string | null;
  note: string | null;
  strategy: ClientStrategy | null;
}

const statusOptions = [
  { value: "prospect", label: "洽談中" },
  { value: "active", label: "合作中" },
  { value: "paused", label: "暫停" },
  { value: "ended", label: "已結束" },
];

const planOptions = [
  { value: "", label: "未選擇" },
  { value: "basic", label: "基礎方案" },
  { value: "growth", label: "品牌成長" },
  { value: "flagship", label: "旗艦方案" },
  { value: "custom", label: "客製方案" },
];

const statusMap: Record<string, { label: string; color: string }> = {
  prospect: { label: "洽談中", color: "bg-yellow-100 text-yellow-700" },
  active: { label: "合作中", color: "bg-green-100 text-green-700" },
  paused: { label: "暫停", color: "bg-gray-100 text-gray-700" },
  ended: { label: "已結束", color: "bg-red-100 text-red-700" },
};

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // 表單欄位
  const [form, setForm] = useState({
    brandName: "",
    industry: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    company: "",
    website: "",
    status: "prospect",
    planTier: "",
    monthlyFee: "",
    contractStart: "",
    contractEnd: "",
    assignedTo: "",
    note: "",
  });

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      const res = await fetch(`/api/admin/clients/${id}`);
      if (res.status === 401) return;
      if (res.status === 404) {
        router.push("/admin/clients");
        return;
      }
      const data = await res.json();
      setClient(data);
      setForm({
        brandName: data.brandName || "",
        industry: data.industry || "",
        contactName: data.contactName || "",
        contactEmail: data.contactEmail || "",
        contactPhone: data.contactPhone || "",
        company: data.company || "",
        website: data.website || "",
        status: data.status || "prospect",
        planTier: data.planTier || "",
        monthlyFee: data.monthlyFee ? String(data.monthlyFee) : "",
        contractStart: data.contractStart || "",
        contractEnd: data.contractEnd || "",
        assignedTo: data.assignedTo || "",
        note: data.note || "",
      });
    } catch (err) {
      console.error("Fetch client error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          monthlyFee: form.monthlyFee ? parseInt(form.monthlyFee) : null,
          planTier: form.planTier || null,
          contractStart: form.contractStart || null,
          contractEnd: form.contractEnd || null,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setClient((prev) => prev ? { ...prev, ...updated } : prev);
        setEditing(false);
      } else {
        alert("儲存失敗");
      }
    } catch {
      alert("儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) return null;

  const status = statusMap[client.status] || { label: client.status, color: "bg-gray-100 text-gray-700" };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin/clients" className="hover:text-blue-600">客戶管理</Link>
        <span>/</span>
        <span className="text-gray-900">{client.brandName}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{client.brandName}</h1>
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>
        <div className="flex gap-3">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              編輯資料
            </button>
          ) : (
            <>
              <button
                onClick={() => { setEditing(false); fetchClient(); }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "儲存中..." : "儲存"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Client Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">基本資料</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 品牌名稱 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">品牌名稱</label>
            {editing ? (
              <input
                type="text"
                value={form.brandName}
                onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm text-gray-900">{client.brandName}</p>
            )}
          </div>
          {/* 產業 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">產業</label>
            {editing ? (
              <input
                type="text"
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm text-gray-900">{client.industry || "—"}</p>
            )}
          </div>
          {/* 公司名稱 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">公司名稱</label>
            {editing ? (
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm text-gray-900">{client.company || "—"}</p>
            )}
          </div>
          {/* 官網 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">官網</label>
            {editing ? (
              <input
                type="text"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm text-gray-900">{client.website || "—"}</p>
            )}
          </div>
          {/* 聯絡人 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">聯絡人</label>
            {editing ? (
              <input
                type="text"
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm text-gray-900">{client.contactName || "—"}</p>
            )}
          </div>
          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
            {editing ? (
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm text-gray-900">{client.contactEmail || "—"}</p>
            )}
          </div>
          {/* 電話 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">電話</label>
            {editing ? (
              <input
                type="text"
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm text-gray-900">{client.contactPhone || "—"}</p>
            )}
          </div>
          {/* 負責人 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">負責人</label>
            {editing ? (
              <input
                type="text"
                value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm text-gray-900">{client.assignedTo || "—"}</p>
            )}
          </div>
        </div>

        {/* 合作資訊 */}
        <h3 className="text-md font-bold text-gray-900 mt-6 mb-4">合作資訊</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 狀態 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">狀態</label>
            {editing ? (
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : (
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                {status.label}
              </span>
            )}
          </div>
          {/* 方案等級 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">方案等級</label>
            {editing ? (
              <select
                value={form.planTier}
                onChange={(e) => setForm({ ...form, planTier: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {planOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-900">
                {planOptions.find((o) => o.value === client.planTier)?.label || "—"}
              </p>
            )}
          </div>
          {/* 月費 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">月費（元）</label>
            {editing ? (
              <input
                type="number"
                value={form.monthlyFee}
                onChange={(e) => setForm({ ...form, monthlyFee: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm text-gray-900">
                {client.monthlyFee ? `$${client.monthlyFee.toLocaleString()}` : "—"}
              </p>
            )}
          </div>
          {/* 合約開始 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">合約開始</label>
            {editing ? (
              <input
                type="date"
                value={form.contractStart}
                onChange={(e) => setForm({ ...form, contractStart: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm text-gray-900">{client.contractStart || "—"}</p>
            )}
          </div>
          {/* 合約結束 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">合約結束</label>
            {editing ? (
              <input
                type="date"
                value={form.contractEnd}
                onChange={(e) => setForm({ ...form, contractEnd: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm text-gray-900">{client.contractEnd || "—"}</p>
            )}
          </div>
        </div>

        {/* 備註 */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-500 mb-1">內部備註</label>
          {editing ? (
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{client.note || "—"}</p>
          )}
        </div>

        {/* 關聯問卷 */}
        {client.submissionId && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link
              href={`/admin/submissions/${client.submissionId}`}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              查看關聯問卷 →
            </Link>
          </div>
        )}
      </div>

      {/* Brand Strategy Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">品牌策略檔案</h2>
          <Link
            href={`/admin/clients/${id}/strategy`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            {client.strategy ? "編輯策略" : "開始建檔"}
          </Link>
        </div>

        {client.strategy ? (
          <div className="space-y-4">
            {/* 品牌人設摘要 */}
            {client.strategy.brandPersonality && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="text-sm font-medium text-purple-700 mb-1">品牌人設</h4>
                <p className="text-sm text-gray-700 line-clamp-2">{client.strategy.brandPersonality}</p>
              </div>
            )}
            {/* 核心價值主張 */}
            {client.strategy.valueProposition && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-700 mb-1">核心價值主張</h4>
                <p className="text-sm text-gray-700">{client.strategy.valueProposition}</p>
              </div>
            )}
            {/* 經營平台 */}
            {client.strategy.platforms && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="text-sm font-medium text-green-700 mb-1">經營平台</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {JSON.parse(client.strategy.platforms).map((p: string) => (
                    <span key={p} className="px-2 py-0.5 bg-white rounded text-xs text-gray-600">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* 發文頻率 */}
            {client.strategy.postFrequency && (
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="text-sm font-medium text-orange-700 mb-1">發文頻率</h4>
                <p className="text-sm text-gray-700">{client.strategy.postFrequency}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <div className="text-4xl mb-3">📋</div>
            <p>尚未建立品牌策略檔案</p>
            <p className="text-xs mt-1">建檔後可以用於 AI 社群貼文產生</p>
          </div>
        )}
      </div>
    </div>
  );
}
