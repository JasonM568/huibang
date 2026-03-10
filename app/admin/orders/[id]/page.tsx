"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Order {
  id: string;
  orderNo: string;
  productType: string;
  planId: string | null;
  amount: number;
  itemName: string | null;
  customerEmail: string;
  customerName: string | null;
  customerPhone: string | null;
  carrierType: string | null;
  carrierNum: string | null;
  paymentStatus: string;
  ecpayTradeNo: string | null;
  invoiceStatus: string;
  invoiceNo: string | null;
  invoiceError: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

const paymentStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "待付款", color: "bg-yellow-100 text-yellow-700" },
  paid: { label: "已付款", color: "bg-green-100 text-green-700" },
  failed: { label: "付款失敗", color: "bg-red-100 text-red-700" },
};

const invoiceStatusMap: Record<string, { label: string; color: string }> = {
  none: { label: "未開立", color: "bg-gray-100 text-gray-500" },
  pending: { label: "開立中", color: "bg-yellow-100 text-yellow-700" },
  issued: { label: "已開立", color: "bg-green-100 text-green-700" },
  failed: { label: "開立失敗", color: "bg-red-100 text-red-700" },
};

const productTypeMap: Record<string, string> = {
  diagnostic: "深度健診",
  "ai-pack": "AI 個體包",
};

const planNameMap: Record<string, string> = {
  "1": "入門方案",
  "2": "進階方案",
  "3": "全配方案",
};

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    carrierNum: "",
    note: "",
  });

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      if (res.status === 401) return;
      if (!res.ok) return;
      const data = await res.json();
      setOrder(data);
      setForm({
        customerName: data.customerName || "",
        customerEmail: data.customerEmail || "",
        customerPhone: data.customerPhone || "",
        carrierNum: data.carrierNum || "",
        note: data.note || "",
      });
    } catch (err) {
      console.error("Fetch order error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrder(updated);
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

  const handleCancel = () => {
    if (order) {
      setForm({
        customerName: order.customerName || "",
        customerEmail: order.customerEmail || "",
        customerPhone: order.customerPhone || "",
        carrierNum: order.carrierNum || "",
        note: order.note || "",
      });
    }
    setEditing(false);
  };

  const handleRetryInvoice = async () => {
    if (!confirm("確定要開立發票嗎？")) return;
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert(`發票開立成功：${data.invoiceNo}`);
        fetchOrder();
      } else {
        alert(`發票開立失敗：${data.error}`);
        fetchOrder();
      }
    } catch {
      alert("操作失敗");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>找不到此訂單</p>
        <Link
          href="/admin/orders"
          className="text-blue-600 hover:underline mt-2 inline-block"
        >
          回訂單列表
        </Link>
      </div>
    );
  }

  const ps = paymentStatusMap[order.paymentStatus] || {
    label: order.paymentStatus,
    color: "bg-gray-100 text-gray-700",
  };
  const is = invoiceStatusMap[order.invoiceStatus] || {
    label: order.invoiceStatus,
    color: "bg-gray-100 text-gray-700",
  };
  const canIssueInvoice =
    order.paymentStatus === "paid" &&
    (order.invoiceStatus === "failed" || order.invoiceStatus === "none");

  return (
    <div>
      {/* Back link */}
      <Link
        href="/admin/orders"
        className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        ← 回訂單列表
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 font-mono">
            {order.orderNo}
          </h1>
          <span
            className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${ps.color}`}
          >
            {ps.label}
          </span>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? "儲存中..." : "儲存"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              編輯
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* 訂單資訊 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            訂單資訊
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="產品類型" value={productTypeMap[order.productType] || order.productType} />
            <Field label="方案" value={order.planId ? planNameMap[order.planId] || order.planId : "—"} />
            <Field label="品名" value={order.itemName || "—"} />
            <Field label="金額" value={`NT$ ${order.amount.toLocaleString()}`} />
            <Field label="建立時間" value={formatDateTime(order.createdAt)} />
            <Field label="更新時間" value={formatDateTime(order.updatedAt)} />
          </div>
        </div>

        {/* 客戶資訊 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            客戶資訊
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {editing ? (
              <>
                <EditField
                  label="姓名"
                  value={form.customerName}
                  onChange={(v) => setForm({ ...form, customerName: v })}
                />
                <EditField
                  label="Email"
                  value={form.customerEmail}
                  type="email"
                  onChange={(v) => setForm({ ...form, customerEmail: v })}
                />
                <EditField
                  label="電話"
                  value={form.customerPhone}
                  type="tel"
                  onChange={(v) => setForm({ ...form, customerPhone: v })}
                />
              </>
            ) : (
              <>
                <Field label="姓名" value={order.customerName || "—"} />
                <Field label="Email" value={order.customerEmail} />
                <Field label="電話" value={order.customerPhone || "—"} />
              </>
            )}
          </div>
        </div>

        {/* 付款 & 發票 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            付款 & 發票
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">付款狀態</p>
              <span
                className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${ps.color}`}
              >
                {ps.label}
              </span>
            </div>
            <Field label="ECPay 交易號" value={order.ecpayTradeNo || "—"} />
            <div>
              <p className="text-xs text-gray-400 mb-1">發票狀態</p>
              <span
                className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${is.color}`}
              >
                {is.label}
              </span>
            </div>
            <Field label="發票號碼" value={order.invoiceNo || "—"} />
            {order.invoiceStatus === "failed" && order.invoiceError && (
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-400 mb-1">發票錯誤</p>
                <p className="text-sm text-red-600">{order.invoiceError}</p>
              </div>
            )}
            {editing ? (
              <EditField
                label="載具號碼"
                value={form.carrierNum}
                onChange={(v) => setForm({ ...form, carrierNum: v })}
                placeholder="/ 開頭 8 碼"
              />
            ) : (
              <Field label="載具號碼" value={order.carrierNum || "—"} />
            )}
          </div>

          {canIssueInvoice && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={handleRetryInvoice}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                開立發票
              </button>
            </div>
          )}
        </div>

        {/* 備註 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            內部備註
          </h2>
          {editing ? (
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="新增備註..."
            />
          ) : (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {order.note || "無備註"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm text-gray-900">{value}</p>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
