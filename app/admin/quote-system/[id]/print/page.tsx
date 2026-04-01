"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface QuoteDetail {
  id: string;
  quoteNumber: string;
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

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  logoUrl: string;
  stampUrl: string;
}

export default function QuotePrintPage() {
  const { id } = useParams();
  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const [showSeals, setShowSeals] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [showStamp, setShowStamp] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/quotes/${id}`).then((r) => r.json()),
      fetch("/api/admin/company").then((r) => r.json()),
    ]).then(([quoteData, companyData]) => {
      setQuote(quoteData);
      setCompany(companyData);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (quote) {
      document.title = `報價單_${quote.quoteNumber}`;
    }
  }, [quote]);

  if (loading || !quote) {
    return <div className="p-8 text-center text-gray-400">載入中...</div>;
  }

  const formatDate = (d: string) => {
    const date = new Date(d);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          @page { margin: 12mm; size: A4; }
        }
        @media screen {
          body { background: #f3f4f6; }
        }
      `}</style>

      {/* Control panel */}
      <div className="no-print fixed top-4 right-4 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-4 w-64">
        <h3 className="text-sm font-bold text-gray-900 mb-3">列印選項</h3>
        <div className="space-y-2 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showSeals} onChange={(e) => setShowSeals(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
            <span className="text-sm text-gray-700">公司大小章</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showSignature} onChange={(e) => setShowSignature(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
            <span className="text-sm text-gray-700">簽名檔</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showStamp} onChange={(e) => setShowStamp(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
            <span className="text-sm text-gray-700">發票章</span>
          </label>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">列印 / 下載 PDF</button>
          <button onClick={() => window.close()} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">關閉</button>
        </div>
      </div>

      <div className="max-w-[210mm] mx-auto bg-white px-10 py-8 sm:my-8 sm:shadow-lg" style={{ fontFamily: "'Noto Sans TC', 'Microsoft JhengHei', sans-serif" }}>

        {/* ===== Header ===== */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            {company?.logoUrl && (
              <img src={company.logoUrl} alt="Logo" className="w-14 h-14 object-contain" />
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">{company?.name || "公司名稱"}</h1>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-700 tracking-widest">報 價 單</h2>
            <div className="text-xs text-gray-500 mt-2 space-y-0.5">
              <p>報價單號：{quote.quoteNumber}</p>
              <p>報價日期：{formatDate(quote.createdAt)}</p>
              <p>有效期限：{formatDate(quote.validUntil)}</p>
            </div>
          </div>
        </div>

        <hr className="border-gray-300 mb-5" />

        {/* ===== 客戶資訊 ===== */}
        <div className="mb-5">
          <h3 className="text-sm font-bold text-gray-700 mb-2">客戶資訊</h3>
          <div className="grid grid-cols-[auto_1fr_auto_1fr] gap-x-4 gap-y-1.5 text-sm">
            <span className="text-gray-500">公司名稱：</span>
            <span className="text-gray-900">{quote.customerName}</span>
            <span className="text-gray-500">統編：</span>
            <span className="text-gray-900">{quote.customerTaxId || "-"}</span>

            <span className="text-gray-500">聯絡人：</span>
            <span className="text-gray-900">{quote.customerContact}</span>
            <span className="text-gray-500">Email：</span>
            <span className="text-gray-900">{quote.customerEmail || "-"}</span>

            {quote.customerPhone && (
              <>
                <span className="text-gray-500">電話：</span>
                <span className="text-gray-900">{quote.customerPhone}</span>
                <span></span><span></span>
              </>
            )}

            {quote.customerAddress && (
              <>
                <span className="text-gray-500">地址：</span>
                <span className="text-gray-900 col-span-3">{quote.customerAddress}</span>
              </>
            )}
          </div>
        </div>

        {/* ===== 項目表格 ===== */}
        <table className="w-full text-sm border-collapse mb-1">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-center font-medium w-12">項次</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-medium">項目</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-medium">規格</th>
              <th className="border border-gray-300 px-3 py-2 text-right font-medium w-24">單價</th>
              <th className="border border-gray-300 px-3 py-2 text-center font-medium w-16">數量</th>
              <th className="border border-gray-300 px-3 py-2 text-right font-medium w-28">金額</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item, index) => (
              <tr key={item.id}>
                <td className="border border-gray-300 px-3 py-2 text-center">{index + 1}</td>
                <td className="border border-gray-300 px-3 py-2">{item.name}</td>
                <td className="border border-gray-300 px-3 py-2 text-gray-600">{item.specification || ""}</td>
                <td className="border border-gray-300 px-3 py-2 text-right">${Number(item.unitPrice).toLocaleString()}</td>
                <td className="border border-gray-300 px-3 py-2 text-center">{item.quantity}</td>
                <td className="border border-gray-300 px-3 py-2 text-right">${Number(item.amount).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ===== 發票章 + 小計/稅額/總計 ===== */}
        <div className="flex justify-between items-start mt-4">
          {/* 左：發票章 */}
          <div className="pt-2">
            {showStamp && company?.stampUrl && (
              <img src={company.stampUrl} alt="發票章" style={{ width: "225px", height: "225px" }} className="object-contain" />
            )}
          </div>

          {/* 右：金額 */}
          <div className="w-72 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">小計</span>
              <span className="font-medium text-gray-900">${Number(quote.subtotal).toLocaleString()}</span>
            </div>
            {parseFloat(quote.discount) > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">折扣 ({quote.discount}%)</span>
                <span className="text-red-600">-${(Number(quote.subtotal) * parseFloat(quote.discount) / 100).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">稅額 ({quote.taxRate}%)</span>
              <span className="font-medium text-gray-900">${Number(quote.taxAmount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3 font-bold text-lg">
              <span>總計</span>
              <span>${Number(quote.totalAmount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ===== 備註 ===== */}
        {quote.notes && (
          <div className="mt-6 mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-1">備註</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{quote.notes}</p>
          </div>
        )}

        {/* ===== 簽章區 ===== */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">報價方簽章</p>
              {showSeals && (
                <div className="flex items-end gap-3 mb-2">
                  <img src="/company/seal-large.png" alt="公司大章" className="w-20 h-20 object-contain" />
                  <img src="/company/seal-small.png" alt="公司小章" className="w-16 h-16 object-contain" />
                </div>
              )}
              {showSignature && (
                <img src="/company/signature.png" alt="簽名" style={{ height: "125px" }} className="object-contain" />
              )}
              {!showSeals && !showSignature && <div className="h-20"></div>}
              <div className="border-b border-gray-400 w-48 mt-2"></div>
              <p className="text-xs text-gray-500 mt-1">{company?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">客戶確認簽章</p>
              <div className="h-20"></div>
              <div className="border-b border-gray-400 w-48"></div>
              <p className="text-xs text-gray-500 mt-1">{quote.customerName}</p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
