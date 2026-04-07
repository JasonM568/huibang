"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Allowance { name: string; amount: string; }
interface Employee { id: string; name: string; baseSalary: string; department: string | null; allowances?: Allowance[]; }
interface ItemForm { _id: string; name: string; amount: string; }

let _nextId = 1;
function newItem(name = "", amount = ""): ItemForm {
  return { _id: `item-${_nextId++}`, name, amount };
}

export default function NewSalaryPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [saving, setSaving] = useState(false);
  const now = new Date();
  const rocYear = now.getFullYear() - 1911;
  const curMonth = now.getMonth() + 1;
  const curLastDay = new Date(now.getFullYear(), curMonth, 0).getDate();
  const curStart = `${now.getFullYear()}-${String(curMonth).padStart(2, "0")}-01`;
  const curEnd = `${now.getFullYear()}-${String(curMonth).padStart(2, "0")}-${String(curLastDay).padStart(2, "0")}`;

  const [form, setForm] = useState({
    employeeId: "", year: rocYear.toString(), month: curMonth.toString(),
    workPeriodStart: curStart, workPeriodEnd: curEnd, payDays: String(curLastDay),
    baseSalary: "0", leaveDays: "", leaveDeduction: "0",
    overtimePay: "0", fullAttendanceBonus: "0", supervisorAllowance: "0",
    laborInsurance: "0", healthInsurance: "0",
    otherDeduction: "0", otherDeductionNote: "", note: "", internalNote: "",
  });
  const [bonuses, setBonuses] = useState<ItemForm[]>([]);
  const [deductions, setDeductions] = useState<ItemForm[]>([]);

  const updateBonus = useCallback((i: number, field: "name" | "amount", value: string) => {
    setBonuses(prev => { const n = [...prev]; n[i] = { ...n[i], [field]: value }; return n; });
  }, []);
  const updateDeduction = useCallback((i: number, field: "name" | "amount", value: string) => {
    setDeductions(prev => { const n = [...prev]; n[i] = { ...n[i], [field]: value }; return n; });
  }, []);

  useEffect(() => {
    fetch("/api/admin/employees?all=1&active=1").then(r => r.json()).then(d => setEmployees(d.data || []));
  }, []);

  const handleEmployeeSelect = async (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    setForm({ ...form, employeeId: empId, baseSalary: emp?.baseSalary || "0" });

    if (empId) {
      try {
        const res = await fetch(`/api/admin/employees/${empId}`);
        const data = await res.json();
        if (data.allowances && data.allowances.length > 0) {
          setBonuses(data.allowances.map((a: Allowance) => newItem(a.name, a.amount)));
        } else {
          setBonuses([]);
        }
      } catch {
        setBonuses([]);
      }
    } else {
      setBonuses([]);
    }
  };

  // 日期起迄改變時自動算計薪天數
  const handleDateChange = (start: string, end: string) => {
    let days = "";
    if (start && end) {
      const diff = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
      if (diff > 0) days = String(diff);
    }
    setForm(f => ({ ...f, workPeriodStart: start, workPeriodEnd: end, ...(days ? { payDays: days } : {}) }));
  };

  // 足月判斷
  const baseSalaryNum = parseInt(form.baseSalary) || 0;
  const monthLastDay = new Date((parseInt(form.year) + 1911), parseInt(form.month), 0).getDate();
  const payDaysNum = parseInt(form.payDays) || 0;
  const isFullMonth = payDaysNum >= monthLastDay;

  // 先算足月應領總額（底薪 + 所有獎金津貼 - 請假扣款）
  const bonusTotal = bonuses.reduce((s, b) => s + (parseInt(b.amount) || 0), 0);
  const fullMonthEarnings = baseSalaryNum - (parseInt(form.leaveDeduction) || 0) + (parseInt(form.overtimePay) || 0) + (parseInt(form.fullAttendanceBonus) || 0) + (parseInt(form.supervisorAllowance) || 0) + bonusTotal;

  // 日薪 = 足月應領總額 / 30
  const dailyWage = fullMonthEarnings > 0 ? Math.round(fullMonthEarnings / 30) : 0;

  // 足月 → 用足月應領總額；不足月 → 日薪 × 計薪天數
  const totalEarnings = isFullMonth ? fullMonthEarnings : dailyWage * payDaysNum;

  const deductionTotal = deductions.reduce((s, d) => s + (parseInt(d.amount) || 0), 0);
  const totalDeductions = (parseInt(form.laborInsurance) || 0) + (parseInt(form.healthInsurance) || 0) + (parseInt(form.otherDeduction) || 0) + deductionTotal;
  const netPay = totalEarnings - totalDeductions;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/salary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, bonuses, deductions }),
    });
    if (res.ok) {
      const record = await res.json();
      router.push(`/admin/salary/${record.id}`);
    } else { alert("建立失敗"); setSaving(false); }
  };

  const handleMonthChange = (month: string) => {
    const y = parseInt(form.year) + 1911; // 民國轉西元
    const m = parseInt(month);
    const lastDay = new Date(y, m, 0).getDate(); // 該月最後一天
    const start = `${y}-${String(m).padStart(2, "0")}-01`;
    const end = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    setForm(f => ({ ...f, month, workPeriodStart: start, workPeriodEnd: end, payDays: String(lastDay) }));
  };

  const handleYearChange = (year: string) => {
    const y = parseInt(year) + 1911;
    const m = parseInt(form.month);
    const lastDay = new Date(y, m, 0).getDate();
    const start = `${y}-${String(m).padStart(2, "0")}-01`;
    const end = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    setForm(f => ({ ...f, year, workPeriodStart: start, workPeriodEnd: end, payDays: String(lastDay) }));
  };

  const renderField = (label: string, field: string, w?: string) => (
    <div className={w || ""} key={field}>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input type="number" value={(form as Record<string, string>)[field]} onChange={(e) => setForm(f => ({ ...f, [field]: e.target.value }))} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
              <input type="number" value={form.year} onChange={(e) => handleYearChange(e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">月份</label>
              <select value={form.month} onChange={(e) => handleMonthChange(e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm">
                {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}月</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">工作期間起</label>
              <input type="date" value={form.workPeriodStart} onChange={(e) => handleDateChange(e.target.value, form.workPeriodEnd)} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">工作期間迄</label>
              <input type="date" value={form.workPeriodEnd} onChange={(e) => handleDateChange(form.workPeriodStart, e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
            </div>
            {renderField("計薪日數", "payDays")}
          </div>
        </div>

        {/* 應領 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-bold text-gray-900 mb-3">應領薪資金額</h2>
          {fullMonthEarnings > 0 && payDaysNum > 0 && (
            <div className="text-xs text-gray-500 mb-3 bg-blue-50 px-3 py-2 rounded space-y-0.5">
              <p>足月應領總額：${fullMonthEarnings.toLocaleString()}</p>
              <p>日薪：<span className="font-medium text-gray-700">${dailyWage.toLocaleString()}</span>（應領總額 ${fullMonthEarnings.toLocaleString()} ÷ 30 天）</p>
              {isFullMonth ? (
                <p>足月，應領：<span className="font-medium text-gray-700">${totalEarnings.toLocaleString()}</span></p>
              ) : (
                <p>不足月，應領：<span className="font-medium text-gray-700">${totalEarnings.toLocaleString()}</span>（日薪 ${dailyWage.toLocaleString()} × {form.payDays} 天）</p>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {renderField("基本薪資", "baseSalary")}
            <div>
              <label className="block text-xs text-gray-500 mb-1">請假日數說明</label>
              <input value={form.leaveDays} onChange={(e) => setForm(f => ({ ...f, leaveDays: e.target.value }))} placeholder="如：事假0210共1日" className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
            </div>
            {renderField("請假扣款", "leaveDeduction")}
            {renderField("加班費", "overtimePay")}
            {renderField("全勤獎金", "fullAttendanceBonus")}
            {renderField("主管加給", "supervisorAllowance")}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">領薪項目</span>
              <button type="button" onClick={() => setBonuses(prev => [...prev, newItem()])} className="text-xs text-blue-600 hover:text-blue-800">+ 新增領薪項目</button>
            </div>
            {bonuses.map((b, i) => (
              <div key={b._id} className="flex gap-2 mb-2">
                <input placeholder="項目名稱" value={b.name} onChange={(e) => updateBonus(i, "name", e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm" />
                <input type="number" placeholder="金額" value={b.amount} onChange={(e) => updateBonus(i, "amount", e.target.value)} className="w-28 px-2 py-1.5 border border-gray-200 rounded text-sm" />
                <button type="button" onClick={() => setBonuses(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-sm">x</button>
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
            {renderField("勞保費", "laborInsurance")}
            {renderField("健保費", "healthInsurance")}
            {renderField("其他扣款", "otherDeduction")}
            <div>
              <label className="block text-xs text-gray-500 mb-1">其他扣款說明</label>
              <input value={form.otherDeductionNote} onChange={(e) => setForm(f => ({ ...f, otherDeductionNote: e.target.value }))} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">應扣項目</span>
              <button type="button" onClick={() => setDeductions(prev => [...prev, newItem()])} className="text-xs text-blue-600 hover:text-blue-800">+ 新增應扣項目</button>
            </div>
            {deductions.map((d, i) => (
              <div key={d._id} className="flex gap-2 mb-2">
                <input placeholder="項目名稱" value={d.name} onChange={(e) => updateDeduction(i, "name", e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm" />
                <input type="number" placeholder="金額" value={d.amount} onChange={(e) => updateDeduction(i, "amount", e.target.value)} className="w-28 px-2 py-1.5 border border-gray-200 rounded text-sm" />
                <button type="button" onClick={() => setDeductions(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-sm">x</button>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-right">
            <span className="text-gray-600">應扣合計：</span><span className="font-bold text-red-600">${totalDeductions.toLocaleString()}</span>
          </div>
        </div>

        {/* 備註 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">備註（會顯示在薪資條上）</label>
            <textarea value={form.note} onChange={(e) => setForm(f => ({ ...f, note: e.target.value }))} rows={2} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">單位備註說明（僅管理者可見，不會列印在薪資條）</label>
            <textarea value={form.internalNote} onChange={(e) => setForm(f => ({ ...f, internalNote: e.target.value }))} rows={2} className="w-full px-2 py-1.5 border border-orange-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-orange-50" placeholder="內部備註..." />
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
