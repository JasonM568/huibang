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
    setLoading(false);
  };

  useEffect(() => { fetchRecords(); }, [year, month]);

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此薪資紀錄？")) return;
    await fetch(`/api/admin/salary/${id}`, { method: "DELETE" });
    fetchRecords();
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
        <Link href="/admin/salary/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">+ 新增薪資</Link>
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
                    <td className="px-4 py-3 font-medium text-gray-900">{r.employeeName}</td>
                    <td className="px-4 py-3 text-gray-600">{r.department || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{r.year}年{r.month}月</td>
                    <td className="px-4 py-3 text-gray-900 text-right">${Number(r.totalEarnings).toLocaleString()}</td>
                    <td className="px-4 py-3 text-red-600 text-right">${Number(r.totalDeductions).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-900 text-right font-medium">${Number(r.netPay).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/salary/${r.id}`} className="text-blue-600 hover:text-blue-800 mr-3">查看</Link>
                      <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-700">刪除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-medium">
                  <td className="px-4 py-3" colSpan={5}>合計 ({records.length} 人)</td>
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
