"use client";

import { useEffect, useState } from "react";

interface MonthlyStats {
  month: number;
  totalNetPay: string;
  totalEarnings: string;
  totalDeductions: string;
  headcount: number;
}

interface EmployeeOption {
  id: string;
  name: string;
}

interface PersonalMonthly {
  month: number;
  baseSalary: string;
  totalEarnings: string;
  totalDeductions: string;
  netPay: string;
}

export default function StatsTab() {
  const now = new Date();
  const rocYear = now.getFullYear() - 1911;
  const [year, setYear] = useState(rocYear.toString());
  const [employeeId, setEmployeeId] = useState("");
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [monthly, setMonthly] = useState<MonthlyStats[] | PersonalMonthly[]>([]);
  const [yearTotal, setYearTotal] = useState<{ totalNetPay: string; totalEarnings: string; totalDeductions: string } | null>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/employees?all=1&active=1").then(r => r.json()).then(d => setEmployees(d.data || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ year });
    if (employeeId) params.set("employeeId", employeeId);
    fetch(`/api/admin/salary/stats?${params}`).then(r => r.json()).then(d => {
      setMonthly(d.monthly || []);
      setYearTotal(d.yearTotal || null);
      setEmployee(d.employee || null);
      setLoading(false);
    });
  }, [year, employeeId]);

  const isPersonal = !!employeeId;

  return (
    <div>
      <div className="flex gap-3 items-center mb-4">
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-500">民國</span>
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="w-20 px-2 py-2 border border-gray-200 rounded-lg text-sm text-center" />
          <span className="text-sm text-gray-500">年</span>
        </div>
        <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="">全公司統計</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">載入中...</div>
      ) : monthly.length === 0 ? (
        <div className="text-center py-12 text-gray-400">無資料</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          {isPersonal && employee && (
            <div className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
              {employee.name} ・ {employee.department || ""} ・ {employee.jobTitle || ""}
            </div>
          )}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">月份</th>
                {!isPersonal && <th className="px-4 py-3 font-medium text-right">人數</th>}
                <th className="px-4 py-3 font-medium text-right">應領</th>
                <th className="px-4 py-3 font-medium text-right">應扣</th>
                <th className="px-4 py-3 font-medium text-right">實領</th>
              </tr>
            </thead>
            <tbody>
              {(monthly as any[]).map((m) => (
                <tr key={m.month} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{m.month}月</td>
                  {!isPersonal && <td className="px-4 py-3 text-gray-600 text-right">{m.headcount}</td>}
                  <td className="px-4 py-3 text-gray-900 text-right">${Number(m.totalEarnings).toLocaleString()}</td>
                  <td className="px-4 py-3 text-red-600 text-right">${Number(m.totalDeductions).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-900 text-right font-medium">${Number(isPersonal ? m.netPay : m.totalNetPay).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            {!isPersonal && yearTotal && (
              <tfoot>
                <tr className="bg-gray-50 font-medium">
                  <td className="px-4 py-3" colSpan={2}>年度合計</td>
                  <td className="px-4 py-3 text-right">${Number(yearTotal.totalEarnings).toLocaleString()}</td>
                  <td className="px-4 py-3 text-red-600 text-right">${Number(yearTotal.totalDeductions).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">${Number(yearTotal.totalNetPay).toLocaleString()}</td>
                </tr>
              </tfoot>
            )}
            {isPersonal && (
              <tfoot>
                <tr className="bg-gray-50 font-medium">
                  <td className="px-4 py-3">年度合計</td>
                  <td className="px-4 py-3 text-right">${(monthly as PersonalMonthly[]).reduce((s, m) => s + Number(m.totalEarnings), 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-red-600 text-right">${(monthly as PersonalMonthly[]).reduce((s, m) => s + Number(m.totalDeductions), 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">${(monthly as PersonalMonthly[]).reduce((s, m) => s + Number(m.netPay), 0).toLocaleString()}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}
