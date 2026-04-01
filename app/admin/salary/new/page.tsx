"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Employee { id: string; name: string; baseSalary: string; department: string | null; }
interface BonusForm { name: string; amount: string; }

export default function NewSalaryPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [saving, setSaving] = useState(false);
  const now = new Date();
  const rocYear = now.getFullYear() - 1911;

  const [form, setForm] = useState({
    employeeId: "", year: rocYear.toString(), month: (now.getMonth() + 1).toString(),
    workPeriodStart: "", workPeriodEnd: "", payDays: "30",
    baseSalary: "0", leaveDays: "", leaveDeduction: "0",
    overtimePay: "0", fullAttendanceBonus: "0", supervisorAllowance: "0",
    laborInsurance: "0", healthInsurance: "0",
    otherDeduction: "0", otherDeductionNote: "", note: "",
  });
  const [bonuses, setBonuses] = useState<BonusForm[]>([]);

  useEffect(() => {
    fetch("/api/admin/employees?all=1&active=1").then(r => r.json()).then(d => setEmployees(d.data || []));
  }, []);

  const handleEmployeeSelect = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    setForm({ ...form, employeeId: empId, baseSalary: emp?.baseSalary || "0" });
  };

  const bonusTotal = bonuses.reduce((s, b) => s + (parseInt(b.amount) || 0), 0);
  const totalEarnings = (parseInt(form.baseSalary) || 0) - (parseInt(form.leaveDeduction) || 0) + (parseInt(form.overtimePay) || 0) + (parseInt(form.fullAttendanceBonus) || 0) + (parseInt(form.supervisorAllowance) || 0) + bonusTotal;
  const totalDeductions = (parseInt(form.laborInsurance) || 0) + (parseInt(form.healthInsurance) || 0) + (parseInt(form.otherDeduction) || 0);
  const netPay = totalEarnings - totalDeductions;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/salary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, bonuses }),
    });
    if (res.ok) {
      const record = await res.json();
      router.push(`/admin/salary/${record.id}`);
    } else { alert("建立失敗"); setSaving(false); }
  };

  const F = ({ label, field, w }: { label: string; field: string; w?: string }) => (
    <div className={w || ""}>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input type="number" value={(form as any)[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">新增薪資紀錄</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 基本 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-bold text-gray-900 mb-3">基本資訊</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">員工 *</label>
              <select required value={form.employeeId} onChange={(e) => handleEmployeeSelect(e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm">
                <option value="">選擇員工</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name} {e.department ? `(${e.department})` : ""}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">民國年</label>
              <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">月份</label>
              <select value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm">
                {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}月</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">工作期間起</label>
              <input value={form.workPeriodStart} onChange={(e) => setForm({ ...form, workPeriodStart: e.target.value })} placeholder="如：2/1" className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">工作期間迄</label>
              <input value={form.workPeriodEnd} onChange={(e) => setForm({ ...form, workPeriodEnd: e.target.value })} placeholder="如：2/28" className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
            </div>
            <F label="計薪日數" field="payDays" />
          </div>
        </div>

        {/* 應領 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-bold text-gray-900 mb-3">應領薪資金額</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <F label="基本薪資" field="baseSalary" />
            <div>
              <label className="block text-xs text-gray-500 mb-1">請假日數說明</label>
              <input value={form.leaveDays} onChange={(e) => setForm({ ...form, leaveDays: e.target.value })} placeholder="如：事假0210共1日" className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
            </div>
            <F label="請假扣款" field="leaveDeduction" />
            <F label="加班費" field="overtimePay" />
            <F label="全勤獎金" field="fullAttendanceBonus" />
            <F label="主管加給" field="supervisorAllowance" />
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">獎金項目</span>
              <button type="button" onClick={() => setBonuses([...bonuses, { name: "", amount: "" }])} className="text-xs text-blue-600 hover:text-blue-800">+ 新增獎金</button>
            </div>
            {bonuses.map((b, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input placeholder="獎金名稱" value={b.name} onChange={(e) => { const nb = [...bonuses]; nb[i].name = e.target.value; setBonuses(nb); }} className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm" />
                <input type="number" placeholder="金額" value={b.amount} onChange={(e) => { const nb = [...bonuses]; nb[i].amount = e.target.value; setBonuses(nb); }} className="w-28 px-2 py-1.5 border border-gray-200 rounded text-sm" />
                <button type="button" onClick={() => setBonuses(bonuses.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-sm">x</button>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-right">
            <span className="text-gray-600">應領合計：</span><span className="font-bold text-gray-900">${totalEarnings.toLocaleString()}</span>
          </div>
        </div>

        {/* 應扣 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-bold text-gray-900 mb-3">應扣金額</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <F label="勞保費" field="laborInsurance" />
            <F label="健保費" field="healthInsurance" />
            <F label="其他扣款" field="otherDeduction" />
            <div>
              <label className="block text-xs text-gray-500 mb-1">其他扣款說明</label>
              <input value={form.otherDeductionNote} onChange={(e) => setForm({ ...form, otherDeductionNote: e.target.value })} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-right">
            <span className="text-gray-600">應扣合計：</span><span className="font-bold text-red-600">${totalDeductions.toLocaleString()}</span>
          </div>
        </div>

        {/* 實領 */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-5 text-right">
          <span className="text-lg font-bold text-gray-900">實領金額：${netPay.toLocaleString()}</span>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{saving ? "建立中..." : "建立薪資紀錄"}</button>
          <button type="button" onClick={() => router.push("/admin/salary")} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">取消</button>
        </div>
      </form>
    </div>
  );
}
