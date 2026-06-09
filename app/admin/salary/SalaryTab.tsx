"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SalaryRecord {
  id: string;
  employeeName: string | null;
  department: string | null;
  year: number;
  month: number;
  baseSalary: string;
  totalEarnings: string;
  totalDeductions: string;
  netPay: string;
}

export default function SalaryTab() {
  const [records, setRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batching, setBatching] = useState(false);
  const now = new Date();
  const rocYear = now.getFullYear() - 1911;
  const [year, setYear] = useState(rocYear.toString());
  const [month, setMonth] = useState((now.getMonth() + 1).toString());

  const fetchRecords = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (year) params.set("year", year);
    if (month) params.set("month", month);
    const res = await fetch(`/api/admin/salary?${params}`);
    const data = await res.json();
    setRecords(data.data || []);
    setSelected(new Set());
    setLoading(false);
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === records.length ? new Set() : new Set(records.map((r) => r.id))
    );
  };

  useEffect(() => { fetchRecords(); }, [year, month]);

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此薪資紀錄？")) return;
    await fetch(`/api/admin/salary/${id}`, { method: "DELETE" });
    fetchRecords();
  };

  const handleDuplicate = async (id: string) => {
    if (!confirm("確定要複製此薪資紀錄到下個月？")) return;
    const res = await fetch(`/api/admin/salary/${id}/duplicate`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setYear(data.year.toString());
      setMonth(data.month.toString());
    } else {
      const err = await res.json().catch(() => ({ error: "複製失敗" }));
      alert(err.error || "複製失敗");
    }
  };

  const handleBatchDuplicate = async () => {
    if (selected.size === 0) return;
    if (!confirm(`確定要將勾選的 ${selected.size} 筆薪資紀錄各自複製到下個月？`)) return;
    setBatching(true);
    let ok = 0;
    let skip = 0;
    let target: { year: number; month: number } | null = null;
    for (const id of selected) {
      const res = await fetch(`/api/admin/salary/${id}/duplicate`, { method: "POST" });
      if (res.ok) {
        ok += 1;
        target = await res.json();
      } else {
        skip += 1;
      }
    }
    setBatching(false);
    alert(`批次複製完成：成功 ${ok} 筆${skip > 0 ? `，跳過 ${skip} 筆（已存在或失敗）` : ""}`);
    if (target) {
      setYear(target.year.toString());
      setMonth(target.month.toString());
    } else {
      fetchRecords();
    }
  };

  const totalNetPay = records.reduce((s, r) => s + Number(r.netPay), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-500">民國</span>
            <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="w-20 px-2 py-2 border border-gray-200 rounded-lg text-sm text-center" />
            <span className="text-sm text-gray-500">年</span>
          </div>
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">全部月份</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}月</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 items-center">
          {selected.size > 0 && (
            <button
              onClick={handleBatchDuplicate}
              disabled={batching}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {batching ? "複製中..." : `批次複製 (${selected.size})`}
            </button>
          )}
          <Link href="/admin/salary/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">+ 新增薪資</Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">載入中...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 text-gray-400">尚無薪資紀錄</div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium w-10">
                    <input
                      type="checkbox"
                      checked={records.length > 0 && selected.size === records.length}
                      onChange={toggleAll}
                      className="w-4 h-4 align-middle cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 font-medium">姓名</th>
                  <th className="px-4 py-3 font-medium">單位</th>
                  <th className="px-4 py-3 font-medium">月份</th>
                  <th className="px-4 py-3 font-medium text-right">應領</th>
                  <th className="px-4 py-3 font-medium text-right">應扣</th>
                  <th className="px-4 py-3 font-medium text-right">實領</th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(r.id)}
                        onChange={() => toggleOne(r.id)}
                        className="w-4 h-4 align-middle cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{r.employeeName}</td>
                    <td className="px-4 py-3 text-gray-600">{r.department || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{r.year}年{r.month}月</td>
                    <td className="px-4 py-3 text-gray-900 text-right">${Number(r.totalEarnings).toLocaleString()}</td>
                    <td className="px-4 py-3 text-red-600 text-right">${Number(r.totalDeductions).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-900 text-right font-medium">${Number(r.netPay).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/salary/${r.id}`} className="text-blue-600 hover:text-blue-800 mr-3">查看</Link>
                      <button onClick={() => handleDuplicate(r.id)} className="text-green-600 hover:text-green-800 mr-3">複製</button>
                      <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-700">刪除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-medium">
                  <td className="px-4 py-3" colSpan={6}>合計 ({records.length} 人)</td>
                  <td className="px-4 py-3 text-right">${totalNetPay.toLocaleString()}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="mt-3 text-right">
            <Link
              href={`/admin/salary/print?year=${year}&month=${month}`}
              target="_blank"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              列印本月薪資條 →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
