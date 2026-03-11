"use client";

import { useState, useEffect } from "react";

interface TrackingSettings {
  tracking_gtm: string;
  tracking_ga4: string;
  tracking_google_ads: string;
  tracking_meta_pixel: string;
  tracking_line_tag: string;
}

const trackingFields = [
  {
    key: "tracking_gtm" as const,
    label: "Google Tag Manager",
    placeholder: "GTM-XXXXXXX",
    description: "GTM 容器 ID，可在 GTM 後台統一管理所有代碼",
  },
  {
    key: "tracking_ga4" as const,
    label: "Google Analytics 4",
    placeholder: "G-XXXXXXXXXX",
    description: "GA4 測量 ID，用於網站流量分析",
  },
  {
    key: "tracking_google_ads" as const,
    label: "Google Ads",
    placeholder: "AW-XXXXXXXXX",
    description: "Google Ads 轉換追蹤 ID",
  },
  {
    key: "tracking_meta_pixel" as const,
    label: "Meta Pixel",
    placeholder: "1234567890",
    description: "Meta (Facebook) 像素 ID，用於廣告追蹤",
  },
  {
    key: "tracking_line_tag" as const,
    label: "LINE Tag",
    placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    description: "LINE Tag ID，用於 LINE 廣告追蹤",
  },
];

export default function TrackingPage() {
  const [settings, setSettings] = useState<TrackingSettings>({
    tracking_gtm: "",
    tracking_ga4: "",
    tracking_google_ads: "",
    tracking_meta_pixel: "",
    tracking_line_tag: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 檢查權限
    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.role === "admin") setIsAdmin(true);
      });

    // 取得目前追蹤碼設定
    fetch("/api/admin/tracking")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setSettings({
            tracking_gtm: data.tracking_gtm || "",
            tracking_ga4: data.tracking_ga4 || "",
            tracking_google_ads: data.tracking_google_ads || "",
            tracking_meta_pixel: data.tracking_meta_pixel || "",
            tracking_line_tag: data.tracking_line_tag || "",
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/tracking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (res.status === 403) {
        setError("需要管理員權限");
        return;
      }

      if (res.ok) {
        setSettings({
          tracking_gtm: data.tracking_gtm || "",
          tracking_ga4: data.tracking_ga4 || "",
          tracking_google_ads: data.tracking_google_ads || "",
          tracking_meta_pixel: data.tracking_meta_pixel || "",
          tracking_line_tag: data.tracking_line_tag || "",
        });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || "儲存失敗");
      }
    } catch {
      setError("儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">追蹤碼管理</h1>
        <p className="text-sm text-gray-500 mt-1">
          管理網站上的行銷追蹤碼，修改後即時生效於所有前台頁面
        </p>
      </div>

      <form onSubmit={handleSave}>
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {trackingFields.map((field) => {
            const hasValue = settings[field.key].length > 0;
            return (
              <div key={field.key}>
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  <span
                    className={`inline-block px-1.5 py-0.5 text-xs rounded ${
                      hasValue
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {hasValue ? "已啟用" : "未設定"}
                  </span>
                </div>
                <input
                  type="text"
                  value={settings[field.key]}
                  onChange={(e) =>
                    setSettings({ ...settings, [field.key]: e.target.value })
                  }
                  disabled={!isAdmin}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
                <p className="text-xs text-gray-400 mt-1">{field.description}</p>
              </div>
            );
          })}

          {isAdmin && (
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? "儲存中..." : "儲存設定"}
              </button>
              {success && (
                <span className="text-sm text-green-600">已儲存成功</span>
              )}
              {error && <span className="text-sm text-red-500">{error}</span>}
            </div>
          )}

          {!isAdmin && (
            <p className="text-sm text-gray-400 pt-2">
              只有管理員可以修改追蹤碼設定
            </p>
          )}
        </div>
      </form>

      <div className="mt-6 bg-gray-50 rounded-xl p-5 text-sm text-gray-500">
        <h3 className="font-medium text-gray-700 mb-2">說明</h3>
        <ul className="space-y-1 list-disc list-inside">
          <li>修改追蹤碼後，變更會立即生效於所有前台頁面</li>
          <li>如不需要某個平台的追蹤碼，留空即可</li>
          <li>GA4 與 Google Ads 使用同一個 gtag.js，會自動合併載入</li>
        </ul>
      </div>
    </div>
  );
}
