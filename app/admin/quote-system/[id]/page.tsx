"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface QuoteDetail {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string | null;
  customerTaxId: string | null;
  customerAddress: string | null;
  customerContact: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  userName: string | null;
  discount: string;
  taxRate: string;
  taxType: string;
  validUntil: string;
  status: string;
  notes: string | null;
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  createdAt: string;
  items: {
    id: string;
    name: string;
    specification: string | null;
    unitPrice: string;
    quantity: number;
    discount: string;
    amount: string;
  }[];
}

const statusOptions = [
  { value: "draft", label: "草稿" },
  { value: "sent", label: "已送出" },
  { value: "accepted", label: "已接受" },
  { value: "rejected", label: "已拒絕" },
  { value: "expired", label: "已過期" },
  { value: "invoiced", label: "已轉請款" },
];

export default function QuoteDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // 轉請款單 / 分期請款 Modal
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [installments, setInstallments] = useState<{ label: string; percent: string }[]>([
    { label: "", percent: "100" },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const fetchQuote = async () => {
    const res = await fetch(`/api/admin/quotes/${id}`);
    if (res.ok) {
      setQuote(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuote();
  }, [id]);

  const updateStatus = async (status: string) => {
    await fetch(`/api/admin/quotes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchQuote();
  };

  const handleDelete = async () => {
    if (!confirm("確定要刪除此報價單？")) return;
    await fetch(`/api/admin/quotes/${id}`, { method: "DELETE" });
    router.push("/admin/quote-system");
  };

  const handleDuplicate = async () => {
    if (!confirm("確定要複製此報價單？")) return;
    const res = await fetch(`/api/admin/quotes/${id}/duplicate`, {
      method: "POST",
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/quote-system/${data.id}/edit`);
    } else {
      const err = await res.json().catch(() => ({ error: "複製失敗" }));
      alert(err.error || "複製失敗");
    }
  };

  const openInvoiceModal = () => {
    setInstallments([{ label: "", percent: "100" }]);
    setShowInvoiceModal(true);
  };

  const totalPercent = installments.reduce((s, i) => s + (Number(i.percent) || 0), 0);
  const percentValid = Math.abs(totalPercent - 100) < 0.01;

  // 預覽各期金額（最後一期吸收尾差），與後端算法一致
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const previewAmounts = (() => {
    if (!quote) return [];
    const qTotal = Number(quote.totalAmount);
    let acc = 0;
    return installments.map((inst, idx) => {
      const isLast = idx === installments.length - 1;
      const amt = isLast ? round2(qTotal - acc) : round2((qTotal * (Number(inst.percent) || 0)) / 100);
      if (!isLast) acc += amt;
      return amt;
    });
  })();

  const submitInvoice = async () => {
    if (installments.length > 1 && !percentValid) {
      alert("分期百分比總和必須為 100%");
      return;
    }
    setSubmitting(true);
    try {
      const isInstallment = installments.length > 1;
      const body: Record<string, unknown> = { quoteId: id };
      if (isInstallment) {
        body.installments = installments.map((inst, idx) => ({
          label: inst.label.trim() || `第${idx + 1}期款`,
          percent: Number(inst.percent) || 0,
        }));
      }
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "轉換失敗" }));
        alert(err.error || "轉換失敗");
        return;
      }
      const data = await res.json();
      setShowInvoiceModal(false);
      if (isInstallment) {
        // 分期：回到請款單列表（已產生多張）
        router.push(`/admin/quote-system?tab=invoices`);
      } else {
        router.push(`/admin/quote-system/invoice/${data.id}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">載入中...</div>;
  }

  if (!quote) {
    return <div className="text-center py-12 text-gray-400">找不到此報價單</div>;
  }

  const isLocked = quote.status === "invoiced";

  // 折前小計與折扣總額由項次推導（subtotal 已存折後小計）
  const listSubtotal = quote.items.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0
  );
  const discountTotal = listSubtotal - quote.items.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/quote-system" className="text-sm text-blue-600 hover:text-blue-800">
            ← 返回報價系統
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{quote.quoteNumber}</h1>
          {isLocked && (
            <p className="text-xs text-orange-600 mt-1">此報價單已轉為請款單，無法修改</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open(`/admin/quote-system/${id}/print`, "_blank")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
          >
            查看 PDF
          </button>
          <button
            onClick={handleDuplicate}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
          >
            複製此報價單
          </button>
          {!isLocked && (
            <>
              <Link
                href={`/admin/quote-system/${id}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                編輯
              </Link>
              <button
                onClick={openInvoiceModal}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
              >
                轉請款單
              </button>
              <select
                value={quote.status}
                onChange={(e) => updateStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.filter(s => s.value !== "invoiced").map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100"
              >
                刪除
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Table */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4">報價項目</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="pb-2 font-medium">項目</th>
                  <th className="pb-2 font-medium">規格</th>
                  <th className="pb-2 font-medium text-right">單價</th>
                  <th className="pb-2 font-medium text-right">數量</th>
                  <th className="pb-2 font-medium text-right">折扣</th>
                  <th className="pb-2 font-medium text-right">小計</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50">
                    <td className="py-2 font-medium text-gray-900">{item.name}</td>
                    <td className="py-2 text-gray-600">{item.specification || "-"}</td>
                    <td className="py-2 text-gray-900 text-right">${Number(item.unitPrice).toLocaleString()}</td>
                    <td className="py-2 text-gray-900 text-right">{item.quantity}</td>
                    <td className="py-2 text-gray-900 text-right">{Number(item.discount) > 0 ? `${Number(item.discount)}%` : "-"}</td>
                    <td className="py-2 text-gray-900 text-right">${Number(item.amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-right space-y-1">
              <div className="text-gray-600">小計：<span className="font-medium text-gray-900">${listSubtotal.toLocaleString()}</span></div>
              {discountTotal > 0 && (
                <div className="text-gray-600">折扣：<span className="text-red-600">-${discountTotal.toLocaleString()}</span></div>
              )}
              <div className="text-gray-600">稅額 ({quote.taxType === "inclusive" ? `內含 ${quote.taxRate}` : quote.taxRate}%)：<span className="font-medium text-gray-900">${Number(quote.taxAmount).toLocaleString()}</span></div>
              <div className="text-lg font-bold text-gray-900">總計{quote.taxType === "inclusive" ? "（含稅）" : ""}：${Number(quote.totalAmount).toLocaleString()}</div>
            </div>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-base font-bold text-gray-900 mb-2">備註</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{quote.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-base font-bold text-gray-900 mb-3">客戶資訊</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">公司名稱</dt>
                <dd className="font-medium text-gray-900">{quote.customerName}</dd>
              </div>
              <div>
                <dt className="text-gray-500">聯絡人</dt>
                <dd className="text-gray-900">{quote.customerContact}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Email</dt>
                <dd className="text-gray-900">{quote.customerEmail}</dd>
              </div>
              {quote.customerPhone && (
                <div>
                  <dt className="text-gray-500">電話</dt>
                  <dd className="text-gray-900">{quote.customerPhone}</dd>
                </div>
              )}
              {quote.customerTaxId && (
                <div>
                  <dt className="text-gray-500">統一編號</dt>
                  <dd className="text-gray-900">{quote.customerTaxId}</dd>
                </div>
              )}
              {quote.customerAddress && (
                <div>
                  <dt className="text-gray-500">地址</dt>
                  <dd className="text-gray-900">{quote.customerAddress}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-base font-bold text-gray-900 mb-3">報價單資訊</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">報價單號</dt>
                <dd className="font-mono text-gray-900">{quote.quoteNumber}</dd>
              </div>
              <div>
                <dt className="text-gray-500">狀態</dt>
                <dd className="text-gray-900">{statusOptions.find(s => s.value === quote.status)?.label || quote.status}</dd>
              </div>
              <div>
                <dt className="text-gray-500">製表人</dt>
                <dd className="text-gray-900">{quote.userName}</dd>
              </div>
              <div>
                <dt className="text-gray-500">有效期限</dt>
                <dd className="text-gray-900">{new Date(quote.validUntil).toLocaleDateString("zh-TW")}</dd>
              </div>
              <div>
                <dt className="text-gray-500">建立日期</dt>
                <dd className="text-gray-900">{new Date(quote.createdAt).toLocaleDateString("zh-TW")}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* 轉請款單 / 分期請款 Modal */}
      {showInvoiceModal && quote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900">轉請款單</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                單期＝全額轉請款；新增多期即依百分比拆成多張分期請款單。
              </p>
            </div>

            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>報價單總額</span>
                <span className="font-medium text-gray-900">${Number(quote.totalAmount).toLocaleString()}</span>
              </div>

              <div className="space-y-2">
                {installments.map((inst, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-5 shrink-0">{idx + 1}.</span>
                    <input
                      type="text"
                      placeholder={`第${idx + 1}期款`}
                      value={inst.label}
                      onChange={(e) => {
                        const next = [...installments];
                        next[idx] = { ...next[idx], label: e.target.value };
                        setInstallments(next);
                      }}
                      className="flex-1 min-w-0 px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="0.01"
                        value={inst.percent}
                        onChange={(e) => {
                          const next = [...installments];
                          next[idx] = { ...next[idx], percent: e.target.value };
                          setInstallments(next);
                        }}
                        className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-500">%</span>
                    </div>
                    <span className="w-24 text-right text-sm text-gray-900 shrink-0">
                      ${previewAmounts[idx]?.toLocaleString() ?? "0"}
                    </span>
                    {installments.length > 1 && (
                      <button
                        onClick={() => setInstallments(installments.filter((_, i) => i !== idx))}
                        className="text-gray-400 hover:text-red-500 text-sm shrink-0"
                        title="移除此期"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => setInstallments([...installments, { label: "", percent: "0" }])}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                ＋ 新增一期
              </button>

              {installments.length > 1 && (
                <div className={`flex items-center justify-between text-sm pt-2 border-t border-gray-100 ${percentValid ? "text-gray-600" : "text-red-600"}`}>
                  <span>百分比合計</span>
                  <span className="font-medium">{totalPercent.toFixed(2)}%{!percentValid && "（須為 100%）"}</span>
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                取消
              </button>
              <button
                onClick={submitInvoice}
                disabled={submitting || (installments.length > 1 && !percentValid)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "處理中..." : installments.length > 1 ? `產生 ${installments.length} 張分期請款單` : "確定轉請款單"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
