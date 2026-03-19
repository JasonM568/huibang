"use client";

import { useEffect, useState } from "react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  agentDelivered: boolean;
}

interface EdmLog {
  id: string;
  createdAt: string;
  subject: string;
  recipientCount: number;
  sentBy: string | null;
  status: string;
}

export default function EdmPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [logs, setLogs] = useState<EdmLog[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<"compose" | "logs">("compose");
  const [result, setResult] = useState<{ success: number; failed: number; total: number } | null>(null);

  useEffect(() => {
    fetch("/api/admin/trial-leads")
      .then((r) => r.json())
      .then((d) => { if (!d.error) setLeads(d.leads); });

    fetch("/api/admin/edm/logs")
      .then((r) => r.json())
      .then((d) => { if (!d.error) setLogs(d.logs); });
  }, []);

  const toggleAll = () => {
    if (selected.size === leads.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(leads.map((l) => l.id)));
    }
  };

  const toggleOne = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const handleSend = async () => {
    if (!subject.trim()) return alert("請填寫主旨");
    if (!bodyHtml.trim()) return alert("請填寫內文");
    if (selected.size === 0) return alert("請選擇至少一位收件人");
    if (!confirm(`確定要寄送給 ${selected.size} 位收件人嗎？`)) return;

    setSending(true);
    setResult(null);
    try {
      const recipients = leads
        .filter((l) => selected.has(l.id))
        .map((l) => ({ email: l.email, name: l.name }));

      const res = await fetch("/api/admin/edm/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, bodyHtml, ctaText, ctaUrl, recipients }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        // 重新載入紀錄
        fetch("/api/admin/edm/logs").then((r) => r.json()).then((d) => { if (!d.error) setLogs(d.logs); });
      } else {
        alert(data.error || "發送失敗");
      }
    } finally {
      setSending(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const statusMap: Record<string, { label: string; color: string }> = {
    sent: { label: "全部成功", color: "text-emerald-600 bg-emerald-50" },
    partial: { label: "部分失敗", color: "text-yellow-600 bg-yellow-50" },
    failed: { label: "全部失敗", color: "text-red-600 bg-red-50" },
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">電子報 EDM</h1>
        <p className="text-sm text-gray-500 mt-1">對試用名單發送行銷 Email</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("compose")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "compose" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
        >
          ✉️ 撰寫發送
        </button>
        <button
          onClick={() => setTab("logs")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "logs" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
        >
          📋 發送紀錄
          {logs.length > 0 && <span className="ml-1.5 bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded-full">{logs.length}</span>}
        </button>
      </div>

      {tab === "compose" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左：編輯器 */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">郵件內容</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">主旨 *</label>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="例：🎉 限時優惠！AI 個體包現在只要 $999"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">內文 * <span className="text-gray-400 font-normal">（支援 HTML）</span></label>
                  <textarea
                    value={bodyHtml}
                    onChange={(e) => setBodyHtml(e.target.value)}
                    rows={10}
                    placeholder={"感謝你之前體驗我們的社群文案機器人！\n\n本月特別推出限時優惠...\n\n<br><br>如有任何問題，歡迎回覆此信。"}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <p className="text-xs text-gray-400 mt-1">可使用 {"<br>"} 換行、{"<b>"} 粗體等基本 HTML 標籤</p>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">CTA 按鈕（選填）</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">按鈕文字</label>
                      <input
                        value={ctaText}
                        onChange={(e) => setCtaText(e.target.value)}
                        placeholder="立即購買 →"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">按鈕連結</label>
                      <input
                        value={ctaUrl}
                        onChange={(e) => setCtaUrl(e.target.value)}
                        placeholder="https://huibang.com.tw/..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 發送結果 */}
            {result && (
              <div className={`rounded-xl p-4 border ${result.failed === 0 ? "bg-emerald-50 border-emerald-200" : "bg-yellow-50 border-yellow-200"}`}>
                <p className={`font-semibold text-sm ${result.failed === 0 ? "text-emerald-700" : "text-yellow-700"}`}>
                  {result.failed === 0 ? "✅ 全部發送成功！" : `⚠️ 部分失敗`}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  成功 {result.success} 封 ／ 失敗 {result.failed} 封 ／ 共 {result.total} 封
                </p>
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={sending || selected.size === 0}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? "發送中..." : `📨 發送給 ${selected.size} 位收件人`}
            </button>
          </div>

          {/* 右：名單選擇 */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                選擇收件人
                <span className="ml-2 text-sm text-gray-400 font-normal">已選 {selected.size} / {leads.length}</span>
              </h2>
              <button
                onClick={toggleAll}
                className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                {selected.size === leads.length ? "取消全選" : "全選"}
              </button>
            </div>

            <div className="overflow-y-auto max-h-[500px] divide-y divide-gray-50">
              {leads.length === 0 ? (
                <p className="py-12 text-center text-gray-400 text-sm">尚無試用名單</p>
              ) : (
                leads.map((lead) => (
                  <label
                    key={lead.id}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(lead.id)}
                      onChange={() => toggleOne(lead.id)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                      <p className="text-xs text-gray-400 truncate">{lead.email}</p>
                    </div>
                    <span className="text-xs text-gray-300 whitespace-nowrap">{formatDate(lead.createdAt).split(" ")[0]}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "logs" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">歷史發送紀錄</h2>
          </div>
          {logs.length === 0 ? (
            <p className="py-12 text-center text-gray-400 text-sm">尚無發送紀錄</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">發送時間</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">主旨</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">收件人數</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">狀態</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">發送者</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => {
                  const s = statusMap[log.status] || { label: log.status, color: "text-gray-600 bg-gray-50" };
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">{formatDate(log.createdAt)}</td>
                      <td className="px-6 py-4 text-gray-900 font-medium">{log.subject}</td>
                      <td className="px-6 py-4 text-gray-700">{log.recipientCount} 人</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.color}`}>{s.label}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{log.sentBy || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
