"use client";

import { useEffect, useState } from "react";
import ProductsTab from "./ProductsTab";
import SpecsTab from "./SpecsTab";
import WarehousesTab from "./WarehousesTab";
import StockTab from "./StockTab";
import ExpiryTab from "./ExpiryTab";
import CustomersTab from "./CustomersTab";

const tabs = [
  { key: "products", label: "商品" },
  { key: "specs", label: "分類與規格" },
  { key: "warehouses", label: "倉庫" },
  { key: "stock", label: "庫存查詢" },
  { key: "expiry", label: "效期警示" },
  { key: "customers", label: "ERP客戶" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function ErpPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("products");

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab && tabs.some((t) => t.key === tab)) {
      setActiveTab(tab as TabKey);
    }
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ERP 進銷存</h1>

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
      {activeTab === "products" && <ProductsTab />}
      {activeTab === "specs" && <SpecsTab />}
      {activeTab === "warehouses" && <WarehousesTab />}
      {activeTab === "stock" && <StockTab />}
      {activeTab === "expiry" && <ExpiryTab />}
      {activeTab === "customers" && <CustomersTab />}
    </div>
  );
}
