"use client";

import { useState } from "react";
import QuotesTab from "./QuotesTab";
import CustomersTab from "./CustomersTab";
import ServicesTab from "./ServicesTab";

const tabs = [
  { key: "quotes", label: "報價單" },
  { key: "customers", label: "客戶資料" },
  { key: "services", label: "服務項目" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function QuoteSystemPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("quotes");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">報價系統</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "quotes" && <QuotesTab />}
      {activeTab === "customers" && <CustomersTab />}
      {activeTab === "services" && <ServicesTab />}
    </div>
  );
}
