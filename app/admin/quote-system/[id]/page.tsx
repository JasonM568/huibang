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
    amount: string;
  }[];
}

const statusOptions = [
  { value: "draft", label: "草稿" },
  { value: "sent", label: "已送出" },
  { value: "accepted", label: "已接受" },
  { value: "rejected", label: "已拒絕" },
  { value: "expired", label: "已過期" },
];

export default function QuoteDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="text-center py-12 text-gray-400">載入中...</div>;
  }

  if (!quote) {
    return <div className="text-center py-12 text-gray-400">找不到此報價單</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/quote-system" className="text-sm text-blue-600 hover:text-blue-800">
            ← 返回報價系統
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{quote.quoteNumber}</h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={quote.status}
            onChange={(e) => updateStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100"
          >
            刪除
          </button>
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
                  <th className="pb-2 font-medium text-right">金額</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50">
                    <td className="py-2 font-medium text-gray-900">{item.name}</td>
                    <td className="py-2 text-gray-600">{item.specification || "-"}</td>
                    <td className="py-2 text-gray-900 text-right">${Number(item.unitPrice).toLocaleString()}</td>
                    <td className="py-2 text-gray-900 text-right">{item.quantity}</td>
                    <td className="py-2 text-gray-900 text-right">${Number(item.amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-right space-y-1">
              <div className="text-gray-600">小計：<span className="font-medium text-gray-900">${Number(quote.subtotal).toLocaleString()}</span></div>
              {parseFloat(quote.discount) > 0 && (
                <div className="text-gray-600">折扣 ({quote.discount}%)：<span className="text-red-600">-${(Number(quote.subtotal) * parseFloat(quote.discount) / 100).toLocaleString()}</span></div>
              )}
              <div className="text-gray-600">稅額 ({quote.taxRate}%)：<span className="font-medium text-gray-900">${Number(quote.taxAmount).toLocaleString()}</span></div>
              <div className="text-lg font-bold text-gray-900">總計：${Number(quote.totalAmount).toLocaleString()}</div>
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
    </div>
  );
}
