"use client";

import { useEffect, useState } from "react";

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  logoUrl: string;
  stampUrl: string;
  bankName: string;
  bankBranch: string;
  bankCode: string;
  bankAccountName: string;
  bankAccountNumber: string;
}

const empty: CompanyInfo = {
  name: "",
  address: "",
  phone: "",
  email: "",
  taxId: "",
  logoUrl: "",
  stampUrl: "",
  bankName: "",
  bankBranch: "",
  bankCode: "",
  bankAccountName: "",
  bankAccountNumber: "",
};

export default function CompanySettingsTab() {
  const [info, setInfo] = useState<CompanyInfo>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/company")
      .then((r) => r.json())
      .then((data) => {
        setInfo({ ...empty, ...data });
        setLoading(false);
      });
  }, []);

  const set = (key: keyof CompanyInfo) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInfo({ ...info, [key]: e.target.value });
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/company", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(info),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      alert("儲存失敗");
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">載入中...</div>;

  const field = (label: string, key: keyof CompanyInfo, placeholder = "") => (
    <div>
      <label className="block text-sm text-gray-500 mb-1">{label}</label>
      <input
        type="text"
        value={info[key]}
        onChange={set(key)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      {/* 公司基本資料 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-base font-bold text-gray-900 mb-4">公司基本資料</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("公司名稱", "name")}
          {field("統一編號", "taxId")}
          {field("電話", "phone")}
          {field("Email", "email")}
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-500 mb-1">地址</label>
            <input
              type="text"
              value={info.address}
              onChange={set("address")}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {field("LOGO 路徑", "logoUrl", "/company/logo.png")}
          {field("發票章路徑", "stampUrl", "/company/stamp.png")}
        </div>
      </div>

      {/* 匯款資訊 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-base font-bold text-gray-900 mb-1">匯款資訊</h2>
        <p className="text-xs text-gray-500 mb-4">填寫後會顯示在每張請款單的「匯款資訊」區塊。</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("銀行", "bankName", "例：玉山銀行")}
          {field("分行", "bankBranch", "例：內湖分行")}
          {field("銀行代號", "bankCode", "例：808")}
          {field("戶名", "bankAccountName", "例：惠邦創意整合行銷有限公司")}
          <div className="sm:col-span-2">
            {field("帳號", "bankAccountNumber", "例：1234567890123")}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "儲存中..." : "儲存"}
        </button>
        {saved && <span className="text-sm text-green-600">已儲存 ✓</span>}
      </div>
    </div>
  );
}
