"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Customer {
  id: string;
  companyName: string;
}

interface Service {
  id: string;
  name: string;
  specification: string | null;
  unitPrice: string;
}

interface QuoteItemForm {
  serviceId: string;
  name: string;
  specification: string;
  amount: string;
}

export default function EditQuotePage() {
  const { id } = useParams();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(true);

  const [form, setForm] = useState({
    customerId: "",
    discount: "0",
    taxRate: "5",
    validUntil: "",
    notes: "",
  });

  const [items, setItems] = useState<QuoteItemForm[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/customers?limit=100").then((r) => r.json()),
      fetch("/api/admin/services?all=1").then((r) => r.json()),
      fetch(`/api/admin/quotes/${id}`).then((r) => r.json()),
    ]).then(([custData, svcData, quoteData]) => {
      setCustomers(custData.data || []);
      setServices(svcData.data || []);

      if (quoteData.status === "invoiced") {
        router.push(`/admin/quote-system/${id}`);
        return;
      }

      setForm({
        customerId: quoteData.customerId,
        discount: quoteData.discount,
        taxRate: quoteData.taxRate,
        validUntil: new Date(quoteData.validUntil).toISOString().split("T")[0],
        notes: quoteData.notes || "",
      });
      setItems(
        quoteData.items.map((item: any) => ({
          serviceId: item.serviceId || "",
          name: item.name,
          specification: item.specification || "",
          amount: item.amount || item.unitPrice || "0",
        }))
      );
      setLoadingQuote(false);
    });
  }, [id, router]);

  const handleServiceSelect = (index: number, serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    const newItems = [...items];
    if (service) {
      newItems[index] = {
        serviceId: service.id,
        name: service.name,
        specification: service.specification || "",
        amount: service.unitPrice,
      };
    } else {
      newItems[index] = { ...newItems[index], serviceId: "" };
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { serviceId: "", name: "", specification: "", amount: "" }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof QuoteItemForm, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );
  const discountAmount = subtotal * (parseFloat(form.discount) || 0) / 100;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * (parseFloat(form.taxRate) || 0) / 100;
  const total = afterDiscount + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const res = await fetch(`/api/admin/quotes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, items }),
    });

    if (res.ok) {
      router.push(`/admin/quote-system/${id}`);
    } else {
      alert("儲存失敗，請檢查資料");
      setSaving(false);
    }
  };

  if (loadingQuote) {
    return <div className="text-center py-12 text-gray-400">載入中...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">編輯報價單</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-bold text-gray-900 mb-4">基本資訊</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">客戶 *</label>
              <select
                required
                value={form.customerId}
                onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選擇客戶</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.companyName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">有效期限 *</label>
              <input
                required
                type="date"
                value={form.validUntil}
                onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">折扣 (%)</label>
              <input
                type="number"
                step="0.01"
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">稅率 (%)</label>
              <input
                type="number"
                step="0.01"
                value={form.taxRate}
                onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">報價項目</h2>
            <button
              type="button"
              onClick={addItem}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
            >
              + 新增項目
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <select
                      value={item.serviceId}
                      onChange={(e) => handleServiceSelect(index, e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    >
                      <option value="">自訂項目</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <input
                      required
                      placeholder="項目名稱"
                      value={item.name}
                      onChange={(e) => updateItem(index, "name", e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm mt-1"
                    />
                  </div>
                  <div>
                    <input
                      placeholder="規格"
                      value={item.specification}
                      onChange={(e) => updateItem(index, "specification", e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    />
                  </div>
                  <div>
                    <input
                      required
                      type="number"
                      step="1"
                      placeholder="金額"
                      value={item.amount}
                      onChange={(e) => updateItem(index, "amount", e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-400 hover:text-red-600 mt-1"
                >
                  x
                </button>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-right space-y-1">
            <div className="text-gray-600">小計：<span className="font-medium text-gray-900">${subtotal.toLocaleString()}</span></div>
            {parseFloat(form.discount) > 0 && (
              <div className="text-gray-600">折扣 ({form.discount}%)：<span className="text-red-600">-${discountAmount.toLocaleString()}</span></div>
            )}
            <div className="text-gray-600">稅額 ({form.taxRate}%)：<span className="font-medium text-gray-900">${taxAmount.toLocaleString()}</span></div>
            <div className="text-lg font-bold text-gray-900">總計：${total.toLocaleString()}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "儲存中..." : "儲存變更"}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/admin/quote-system/${id}`)}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
