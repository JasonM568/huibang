"use client";

import { useState, useEffect } from "react";
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

interface UsageData {
  thisMonth: {
    count: number;
    totalInput: number;
    totalOutput: number;
    totalCost: number;
  };
  lastMonth: {
    count: number;
    totalCost: number;
  };
  byEndpoint: {
    endpoint: string;
    count: number;
    totalInput: number;
    totalOutput: number;
    totalCost: number;
  }[];
  daily: { date: string; count: number; cost: number }[];
  recentLogs: {
    id: string;
    createdAt: string;
    endpoint: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    costUsd: string;
  }[];
}

const endpointLabels: Record<string, string> = {
  analyze: "品牌分析",
  "analyze-deep": "深度健診",
  "content-studio": "貼文產生器",
};

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

export default function UsagePage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/usage")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (json.error) {
          setErrorMsg(json.detail || json.error);
          return;
        }
        setData(json);
      })
      .catch((err) => setErrorMsg(err.message || "網路錯誤"))
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
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 mb-2">載入失敗</p>
        {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
      </div>
    );
  }

  const avgCost =
    data.thisMonth.count > 0
      ? (data.thisMonth.totalCost / data.thisMonth.count).toFixed(4)
      : "0";

  const pieData = data.byEndpoint.map((r) => ({
    name: endpointLabels[r.endpoint] || r.endpoint,
    value: r.count,
    cost: r.totalCost,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">API 用量</h1>
        <p className="text-sm text-gray-500 mt-1">
          Claude Sonnet 4 — Input $3 / Output $15 per 1M tokens
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">本月費用</p>
          <p className="text-3xl font-bold text-gray-900">
            ${data.thisMonth.totalCost.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            ≈ NT${(data.thisMonth.totalCost * 31).toFixed(0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">本月呼叫次數</p>
          <p className="text-3xl font-bold text-blue-600">
            {data.thisMonth.count}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {(data.thisMonth.totalInput + data.thisMonth.totalOutput).toLocaleString()} tokens
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">平均每次費用</p>
          <p className="text-3xl font-bold text-green-600">${avgCost}</p>
          <p className="text-xs text-gray-400 mt-1">USD / 次</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">上月費用</p>
          <p className="text-3xl font-bold text-gray-500">
            ${data.lastMonth.totalCost.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {data.lastMonth.count} 次呼叫
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Daily trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">
            近 30 天每日呼叫數
          </h2>
          {data.daily.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.daily}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number, name: string) =>
                    name === "cost"
                      ? [`$${value.toFixed(4)}`, "費用"]
                      : [value, "次數"]
                  }
                />
                <Bar
                  dataKey="count"
                  name="次數"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-60 text-gray-400">
              尚無資料
            </div>
          )}
        </div>

        {/* By endpoint */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">
            各功能用量（本月）
          </h2>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {pieData.map((item, i) => (
                  <div key={item.name} className="text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                      <span className="text-gray-600">{item.name}</span>
                      <span className="font-semibold text-gray-900">
                        {item.value} 次
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 ml-5">
                      ${item.cost.toFixed(4)}
                    </p>
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

      {/* Recent logs table */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">最近呼叫記錄</h2>
        {data.recentLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="py-2 pr-4">時間</th>
                  <th className="py-2 pr-4">功能</th>
                  <th className="py-2 pr-4 text-right">Input</th>
                  <th className="py-2 pr-4 text-right">Output</th>
                  <th className="py-2 text-right">費用 (USD)</th>
                </tr>
              </thead>
              <tbody>
                {data.recentLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-2 pr-4 text-gray-500">
                      {new Date(log.createdAt).toLocaleString("zh-TW", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2 pr-4">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                        {endpointLabels[log.endpoint] || log.endpoint}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-right text-gray-600">
                      {log.inputTokens.toLocaleString()}
                    </td>
                    <td className="py-2 pr-4 text-right text-gray-600">
                      {log.outputTokens.toLocaleString()}
                    </td>
                    <td className="py-2 text-right font-mono text-gray-900">
                      ${Number(log.costUsd).toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            尚無呼叫記錄，使用品牌分析、深度健診或貼文產生器後會自動記錄
          </div>
        )}
      </div>
    </div>
  );
}
