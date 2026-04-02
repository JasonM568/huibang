"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  quoteId: string;
  quoteNumber: string | null;
  customerName: string | null;
  customerTaxId: string | null;
  customerAddress: string | null;
  customerContact: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  userName: string | null;
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  invoiceStatus: string;
  taxInvoiceNo: string | null;
  issuedDate: string | null;
  sentDate: string | null;
  paymentStatus: string;
  expectedPayDate: string | null;
  paidDate: string | null;
  bankAccountLast5: string | null;
  notes: string | null;
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

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = async () => {
    const res = await fetch(`/api/admin/invoices/${id}`);
    if (res.ok) {
      setInvoice(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const updateField = async (updates: Record<string, string | null>) => {
    await fetch(`/api/admin/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    fetchInvoice();
  };

  const handleDelete = async () => {
    if (!confirm("確定要刪除此請款單？")) return;
    await fetch(`/api/admin/invoices/${id}`, { method: "DELETE" });
    router.push("/admin/quote-system");
  };

  if (loading) return <div className="text-center py-12 text-gray-400">載入中...</div>;
  if (!invoice) return <div className="text-center py-12 text-gray-400">找不到此請款單</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/quote-system" className="text-sm text-blue-600 hover:text-blue-800">
            ← 返回報價系統
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">請款單 {invoice.invoiceNumber}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            來自報價單 <Link href={`/admin/quote-system/${invoice.quoteId}`} className="text-blue-600 hover:underline">{invoice.quoteNumber}</Link>
          </p>
        </div>
        <div className="flex items-center gap-3">
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
            <h2 className="text-base font-bold text-gray-900 mb-4">請款項目</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="pb-2 font-medium">項目</th>
                  <th className="pb-2 font-medium">規格</th>
                  <th className="pb-2 font-medium text-right">金額</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50">
                    <td className="py-2 font-medium text-gray-900">{item.name}</td>
                    <td className="py-2 text-gray-600">{item.specification || "-"}</td>
                    <td className="py-2 text-gray-900 text-right">${Number(item.amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-right space-y-1">
              <div className="text-gray-600">小計：<span className="font-medium text-gray-900">${Number(invoice.subtotal).toLocaleString()}</span></div>
              <div className="text-gray-600">稅額：<span className="font-medium text-gray-900">${Number(invoice.taxAmount).toLocaleString()}</span></div>
              <div className="text-lg font-bold text-gray-900">總計：${Number(invoice.totalAmount).toLocaleString()}</div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-base font-bold text-gray-900 mb-2">備註</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Invoice Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4">發票狀態</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">發票開立</label>
                <select
                  value={invoice.invoiceStatus}
                  onChange={(e) => {
                    const status = e.target.value;
                    const updates: Record<string, string | null> = { invoiceStatus: status };
                    if (status === "issued" && !invoice.issuedDate) {
                      updates.issuedDate = new Date().toISOString();
                    }
                    updateField(updates);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="unissued">未開</option>
                  <option value="issued">已開</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-1">發票號碼</label>
                <input
                  type="text"
                  placeholder="例：AB-12345678"
                  value={invoice.taxInvoiceNo || ""}
                  onBlur={(e) => updateField({ taxInvoiceNo: e.target.value || null })}
                  onChange={(e) => setInvoice({ ...invoice, taxInvoiceNo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-1">開立日期</label>
                <input
                  type="date"
                  value={invoice.issuedDate ? new Date(invoice.issuedDate).toISOString().split("T")[0] : ""}
                  onChange={(e) => updateField({ issuedDate: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-1">寄出日期</label>
                <input
                  type="date"
                  value={invoice.sentDate ? new Date(invoice.sentDate).toISOString().split("T")[0] : ""}
                  onChange={(e) => updateField({ sentDate: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4">付款狀態</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">付款狀態</label>
                <select
                  value={invoice.paymentStatus}
                  onChange={(e) => {
                    const status = e.target.value;
                    const updates: Record<string, string | null> = { paymentStatus: status };
                    if (status === "paid" && !invoice.paidDate) {
                      updates.paidDate = new Date().toISOString();
                    }
                    updateField(updates);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="unpaid">未付</option>
                  <option value="paid">已付</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-1">預計付款日期</label>
                <input
                  type="date"
                  value={invoice.expectedPayDate ? new Date(invoice.expectedPayDate).toISOString().split("T")[0] : ""}
                  onChange={(e) => updateField({ expectedPayDate: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-1">實際入帳日期</label>
                <input
                  type="date"
                  value={invoice.paidDate ? new Date(invoice.paidDate).toISOString().split("T")[0] : ""}
                  onChange={(e) => updateField({ paidDate: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-1">匯款帳號末5碼</label>
                <input
                  type="text"
                  maxLength={5}
                  placeholder="例：12345"
                  value={invoice.bankAccountLast5 || ""}
                  onBlur={(e) => updateField({ bankAccountLast5: e.target.value || null })}
                  onChange={(e) => setInvoice({ ...invoice, bankAccountLast5: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-base font-bold text-gray-900 mb-3">客戶資訊</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">公司名稱</dt>
                <dd className="font-medium text-gray-900">{invoice.customerName}</dd>
              </div>
              <div>
                <dt className="text-gray-500">聯絡人</dt>
                <dd className="text-gray-900">{invoice.customerContact}</dd>
              </div>
              {invoice.customerTaxId && (
                <div>
                  <dt className="text-gray-500">統一編號</dt>
                  <dd className="text-gray-900">{invoice.customerTaxId}</dd>
                </div>
              )}
              {invoice.customerEmail && (
                <div>
                  <dt className="text-gray-500">Email</dt>
                  <dd className="text-gray-900">{invoice.customerEmail}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
