"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardData {
  questionnaire: {
    total: number;
    thisMonth: number;
    thisWeek: number;
    byStatus: Record<string, number>;
    avgScore: number | null;
  };
  contact: {
    total: number;
    unread: number;
    thisWeek: number;
  };
  charts: {
    daily: { date: string; count: number }[];
    industry: { name: string; count: number }[];
  };
}

const statusLabels: Record<string, string> = {
  pending: "待分析",
  analyzed: "已分析",
  contacted: "已聯繫",
  converted: "已成交",
};

const statusColors: Record<string, string> = {
  pending: "#f59e0b",
  analyzed: "#10b981",
  contacted: "#3b82f6",
  converted: "#8b5cf6",
};

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#ec4899", "#06b6d4", "#f97316"];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-20 text-gray-400">載入失敗</div>;
  }

  const q = data.questionnaire;
  const c = data.contact;

  const statusPieData = Object.entries(q.byStatus).map(([key, value]) => ({
    name: statusLabels[key] || key,
    value: Number(value),
    color: statusColors[key] || "#94a3b8",
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">儀表板</h1>
        <p className="text-sm text-gray-500 mt-1">數據總覽</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">問卷總數</p>
          <p className="text-3xl font-bold text-gray-900">{q.total}</p>
          <p className="text-xs text-gray-400 mt-1">本週 +{q.thisWeek}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">平均品牌分數</p>
          <p className="text-3xl font-bold text-blue-600">{q.avgScore ?? "—"}</p>
          <p className="text-xs text-gray-400 mt-1">滿分 100</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">待處理問卷</p>
          <p className="text-3xl font-bold text-amber-500">
            {(q.byStatus.pending || 0) + (q.byStatus.analyzed || 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">待分析 + 已分析未聯繫</p>
        </div>
        <Link
          href="/admin/contacts"
          className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 transition-colors"
        >
          <p className="text-sm text-gray-500 mb-1">聯絡表單</p>
          <p className="text-3xl font-bold text-gray-900">{c.total}</p>
          <p className="text-xs mt-1">
            {c.unread > 0 ? (
              <span className="text-red-500 font-medium">{c.unread} 則未讀</span>
            ) : (
              <span className="text-gray-400">全部已讀</span>
            )}
          </p>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Daily submissions chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">近 30 天問卷提交</h2>
          {data.charts.daily.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.charts.daily}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="提交數" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-60 text-gray-400">
              尚無資料
            </div>
          )}
        </div>

        {/* Status distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">問卷狀態分布</h2>
          {statusPieData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {statusPieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-600">{item.name}</span>
                    <span className="font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-60 text-gray-400">
              尚無資料
            </div>
          )}
        </div>
      </div>

      {/* Industry distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">產業分布</h2>
        {data.charts.industry.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.charts.industry} layout="vertical">
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" name="數量" radius={[0, 4, 4, 0]}>
                {data.charts.industry.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-60 text-gray-400">
            尚無資料
          </div>
        )}
      </div>
    </div>
  );
}
