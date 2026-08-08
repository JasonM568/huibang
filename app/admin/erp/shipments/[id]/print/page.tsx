"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface ShipmentItem {
  id: string;
  sku: string;
  productName: string;
  specification: string | null;
  unit: string;
  shippedQuantity: number;
  batchNo: string | null;
  batchExpiry: string | null;
  note: string | null;
}

interface ShipmentDetail {
  id: string;
  shipmentNumber: string;
  shipDate: string;
  status: string;
  signedBy: string | null;
  shippingAddress: string | null;
  note: string | null;
  orderNumber: string | null;
  customer: { companyName: string; contactName: string | null; phone: string | null; address: string | null } | null;
  warehouseName: string | null;
  items: ShipmentItem[];
}

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
}

export default function ShipmentPrintPage() {
  const { id } = useParams();
  const [shipment, setShipment] = useState<ShipmentDetail | null>(null);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/erp/shipments/${id}`).then((r) => r.json()),
      fetch("/api/admin/company").then((r) => r.json()),
    ]).then(([shipmentData, companyData]) => {
      setShipment(shipmentData);
      setCompany(companyData);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (shipment) {
      document.title = `出貨單_${shipment.shipmentNumber}`;
    }
  }, [shipment]);

  if (loading || !shipment) {
    return <div className="p-8 text-center text-gray-400">載入中...</div>;
  }

  const totalQty = shipment.items.reduce((acc, it) => acc + it.shippedQuantity, 0);

  return (
    <>
      <style jsx global>{`
        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          @page { margin: 10mm 12mm; size: A4; }
        }
        @media screen {
          body { background: #f3f4f6; }
        }
      `}</style>

      {/* Control panel */}
      <div className="no-print fixed top-4 right-4 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-4 w-64">
        <h3 className="text-sm font-bold text-gray-900 mb-3">列印</h3>
        <button
          onClick={() => window.print()}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          列印 / 存成 PDF
        </button>
        <button
          onClick={() => window.close()}
          className="w-full mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
        >
          關閉
        </button>
      </div>

      {/* A4 sheet */}
      <div className="max-w-[210mm] mx-auto bg-white p-10 my-6 print:my-0 print:p-0 text-gray-900">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold">{company?.name || ""}</h1>
          <p className="text-xs text-gray-500 mt-1">
            {company?.address && <span>{company.address}</span>}
            {company?.phone && <span className="ml-3">TEL: {company.phone}</span>}
            {company?.taxId && <span className="ml-3">統編: {company.taxId}</span>}
          </p>
          <h2 className="text-2xl font-bold tracking-[0.5em] mt-4">出 貨 單</h2>
        </div>

        {/* Info */}
        <div className="flex justify-between text-sm mb-4">
          <div className="space-y-1">
            <p><span className="text-gray-500 inline-block w-20">客戶名稱</span>{shipment.customer?.companyName || "-"}</p>
            <p><span className="text-gray-500 inline-block w-20">聯絡人</span>{shipment.customer?.contactName || "-"}</p>
            <p><span className="text-gray-500 inline-block w-20">電話</span>{shipment.customer?.phone || "-"}</p>
            <p><span className="text-gray-500 inline-block w-20">送達地址</span>{shipment.shippingAddress || "-"}</p>
          </div>
          <div className="space-y-1 text-right">
            <p><span className="text-gray-500 mr-2">出貨單號</span><span className="font-mono">{shipment.shipmentNumber}</span></p>
            <p><span className="text-gray-500 mr-2">訂單編號</span><span className="font-mono">{shipment.orderNumber || "-"}</span></p>
            <p><span className="text-gray-500 mr-2">出貨日期</span>{shipment.shipDate}</p>
            <p><span className="text-gray-500 mr-2">出貨倉</span>{shipment.warehouseName || "-"}</p>
          </div>
        </div>

        {/* Items */}
        <table className="w-full text-sm border-collapse mb-4">
          <thead>
            <tr className="border-y-2 border-gray-800 text-left">
              <th className="py-2 pr-2 w-10 text-center">#</th>
              <th className="py-2 pr-2 w-28">品號</th>
              <th className="py-2 pr-2">品名</th>
              <th className="py-2 pr-2 w-32">批號</th>
              <th className="py-2 pr-2 w-24">效期</th>
              <th className="py-2 w-24 text-right">數量</th>
            </tr>
          </thead>
          <tbody>
            {shipment.items.map((it, idx) => (
              <tr key={it.id} className="border-b border-gray-200">
                <td className="py-2 pr-2 text-center text-gray-500">{idx + 1}</td>
                <td className="py-2 pr-2 font-mono">{it.sku}</td>
                <td className="py-2 pr-2">
                  {it.productName}
                  {it.specification && <span className="text-xs text-gray-500 ml-1">（{it.specification}）</span>}
                </td>
                <td className="py-2 pr-2 font-mono">{it.batchNo || "—"}</td>
                <td className="py-2 pr-2">{it.batchExpiry || "—"}</td>
                <td className="py-2 text-right tabular-nums">{it.shippedQuantity} {it.unit}</td>
              </tr>
            ))}
            <tr className="border-b-2 border-gray-800">
              <td colSpan={5} className="py-2 text-right text-gray-500 pr-2">合計</td>
              <td className="py-2 text-right font-bold tabular-nums">{totalQty}</td>
            </tr>
          </tbody>
        </table>

        {/* Note */}
        {shipment.note && (
          <div className="text-sm mb-6">
            <span className="text-gray-500 mr-2">備註</span>
            {shipment.note}
          </div>
        )}

        {/* Signature */}
        <div className="grid grid-cols-3 gap-8 mt-12 text-sm text-center">
          <div>
            <div className="border-b border-gray-400 h-16" />
            <p className="mt-2 text-gray-500">出貨人員</p>
          </div>
          <div>
            <div className="border-b border-gray-400 h-16" />
            <p className="mt-2 text-gray-500">送貨人員</p>
          </div>
          <div>
            <div className="border-b border-gray-400 h-16 flex items-end justify-center pb-1">
              {shipment.signedBy && <span>{shipment.signedBy}</span>}
            </div>
            <p className="mt-2 text-gray-500">客戶簽收</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-10">
          本單為出貨簽收憑證，如品項/數量有誤請於三日內聯繫，逾期視同驗收無誤。
        </p>
      </div>
    </>
  );
}
