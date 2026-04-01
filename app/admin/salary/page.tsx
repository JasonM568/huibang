"use client";

import { useState } from "react";
import EmployeesTab from "./EmployeesTab";
import SalaryTab from "./SalaryTab";
import StatsTab from "./StatsTab";

const tabs = [
  { key: "salary", label: "薪資紀錄" },
  { key: "stats", label: "年度統計" },
  { key: "employees", label: "員工資料" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function SalaryPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("salary");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">薪資管理</h1>
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
      {activeTab === "salary" && <SalaryTab />}
      {activeTab === "stats" && <StatsTab />}
      {activeTab === "employees" && <EmployeesTab />}
    </div>
  );
}
