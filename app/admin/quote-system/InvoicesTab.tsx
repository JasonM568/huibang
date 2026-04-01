"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Invoice {
  id: string;
  invoiceNumber: string;
  quoteNumber: string | null;
  customerName: string | null;
  totalAmount: string;
  invoiceStatus: string;
  issuedDate: string | null;
  sentDate: string | null;
  paymentStatus: string;
  createdAt: string;
}

const invoiceStatusMap: Record<string, { label: string; color: string }> = {
  unissued: { label: "未開", color: "bg-yellow-100 text-yellow-700" },
  issued: { label: "已開", color: "bg-green-100 text-green-700" },
};

const paymentStatusMap: Record<string, { label: string; color: string }> = {
  unpaid: { label: "未付", color: "bg-red-100 text-red-700" },
  paid: { label: "已付", color: "bg-green-100 text-green-700" },
};

export default function InvoicesTab() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceStatus, setInvoiceStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const fetchInvoices = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (invoiceStatus) params.set("invoiceStatus", invoiceStatus);
    if (paymentStatus) params.set("paymentStatus", paymentStatus);
    const res = await fetch(`/api/admin/invoices?${params}`);
    const data = await res.json();
    setInvoices(data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, [invoiceStatus, paymentStatus]);

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此請款單？")) return;
    await fetch(`/api/admin/invoices/${id}`, { method: "DELETE" });
    fetchInvoices();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-3">
          <select
            value={invoiceStatus}
            onChange={(e) => setInvoiceStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">發票狀態</option>
            <option value="unissued">未開</option>
            <option value="issued">已開</option>
          </select>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">付款狀態</option>
            <option value="unpaid">未付</option>
            <option value="paid">已付</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">載入中...</div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-12 text-gray-400">尚無請款單（從報價單轉換建立）</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">請款單號</th>
                <th className="px-4 py-3 font-medium">報價單號</th>
                <th className="px-4 py-3 font-medium">客戶</th>
                <th className="px-4 py-3 font-medium text-right">金額</th>
                <th className="px-4 py-3 font-medium">發票</th>
                <th className="px-4 py-3 font-medium">開立日期</th>
                <th className="px-4 py-3 font-medium">寄出日期</th>
                <th className="px-4 py-3 font-medium">付款</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const is_ = invoiceStatusMap[inv.invoiceStatus] || invoiceStatusMap.unissued;
                const ps = paymentStatusMap[inv.paymentStatus] || paymentStatusMap.unpaid;
                return (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-900">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">{inv.quoteNumber || "-"}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{inv.customerName || "-"}</td>
                    <td className="px-4 py-3 text-gray-900 text-right">${Number(inv.totalAmount).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${is_.color}`}>
                        {is_.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {inv.issuedDate ? new Date(inv.issuedDate).toLocaleDateString("zh-TW") : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {inv.sentDate ? new Date(inv.sentDate).toLocaleDateString("zh-TW") : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ps.color}`}>
                        {ps.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/quote-system/invoice/${inv.id}`}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        查看
                      </Link>
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        刪除
                      </button>
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
