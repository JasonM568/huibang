"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface ItemRow { _id: string; id?: string; name: string; amount: string; }

let _nextId = 1;
function newItem(name = "", amount = ""): ItemRow {
  return { _id: `item-${_nextId++}`, name, amount };
}
interface SalaryDetail {
  id: string; employeeName: string | null; department: string | null; jobTitle: string | null; jobGrade: string | null;
  year: number; month: number; workPeriodStart: string | null; workPeriodEnd: string | null; payDays: number | null;
  baseSalary: string; leaveDays: string | null; leaveDeduction: string;
  overtimePay: string; fullAttendanceBonus: string; supervisorAllowance: string;
  laborInsurance: string; healthInsurance: string;
  otherDeduction: string; otherDeductionNote: string | null;
  totalEarnings: string; totalDeductions: string; netPay: string;
  note: string | null; bonuses: ItemRow[]; deductions: ItemRow[];
}

export default function SalaryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<SalaryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    baseSalary: "0", leaveDays: "", leaveDeduction: "0",
    overtimePay: "0", fullAttendanceBonus: "0", supervisorAllowance: "0",
    laborInsurance: "0", healthInsurance: "0",
    otherDeduction: "0", otherDeductionNote: "", note: "",
    workPeriodStart: "", workPeriodEnd: "", payDays: "30",
  });
  const [bonuses, setBonuses] = useState<ItemRow[]>([]);
  const [deductions, setDeductions] = useState<ItemRow[]>([]);

  const updateBonus = useCallback((i: number, field: "name" | "amount", value: string) => {
    setBonuses(prev => { const n = [...prev]; n[i] = { ...n[i], [field]: value }; return n; });
  }, []);
  const updateDeduction = useCallback((i: number, field: "name" | "amount", value: string) => {
    setDeductions(prev => { const n = [...prev]; n[i] = { ...n[i], [field]: value }; return n; });
  }, []);

  const fetchRecord = () => {
    fetch(`/api/admin/salary/${id}`).then(r => r.json()).then(d => { setRecord(d); setLoading(false); });
  };

  useEffect(() => { fetchRecord(); }, [id]);

  const startEditing = () => {
    if (!record) return;
    setForm({
      baseSalary: record.baseSalary,
      leaveDays: record.leaveDays || "",
      leaveDeduction: record.leaveDeduction,
      overtimePay: record.overtimePay,
      fullAttendanceBonus: record.fullAttendanceBonus,
      supervisorAllowance: record.supervisorAllowance,
      laborInsurance: record.laborInsurance,
      healthInsurance: record.healthInsurance,
      otherDeduction: record.otherDeduction,
      otherDeductionNote: record.otherDeductionNote || "",
      note: record.note || "",
      workPeriodStart: record.workPeriodStart || "",
      workPeriodEnd: record.workPeriodEnd || "",
      payDays: record.payDays?.toString() || "30",
    });
    setBonuses(record.bonuses.map(b => newItem(b.name, b.amount)));
    setDeductions((record.deductions || []).map(d => newItem(d.name, d.amount)));
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/admin/salary/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, year: record?.year, month: record?.month, bonuses, deductions }),
    });
    if (res.ok) {
      setEditing(false);
      fetchRecord();
    } else {
      alert("儲存失敗");
    }
    setSaving(false);
  };

  if (loading) return <div className="text-center py-12 text-gray-400">載入中...</div>;
  if (!record) return <div className="text-center py-12 text-gray-400">找不到紀錄</div>;

  const n = (v: string) => Number(v).toLocaleString();

  // 日薪 = 底薪 / 30（固定基數）
  const editBaseSalary = parseInt(form.baseSalary) || 0;
  const editDailyWage = editBaseSalary > 0 ? Math.round(editBaseSalary / 30) : 0;
  const editMonthLastDay = record ? new Date((record.year + 1911), record.month, 0).getDate() : 30;
  const editPayDays = parseInt(form.payDays) || 0;
  const editIsFullMonth = editPayDays >= editMonthLastDay;
  const editActualBasePay = editIsFullMonth ? editBaseSalary : editDailyWage * editPayDays;

  // 日期起迄改變時自動算計薪天數
  const handleDateChange = (start: string, end: string) => {
    let days = "";
    if (start && end) {
      const diff = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
      if (diff > 0) days = String(diff);
    }
    setForm(f => ({ ...f, workPeriodStart: start, workPeriodEnd: end, ...(days ? { payDays: days } : {}) }));
  };

  const bonusTotal = bonuses.reduce((s, b) => s + (parseInt(b.amount) || 0), 0);
  const deductionTotal = deductions.reduce((s, d) => s + (parseInt(d.amount) || 0), 0);
  const editTotalEarnings = editActualBasePay - (parseInt(form.leaveDeduction) || 0) + (parseInt(form.overtimePay) || 0) + (parseInt(form.fullAttendanceBonus) || 0) + (parseInt(form.supervisorAllowance) || 0) + bonusTotal;
  const editTotalDeductions = (parseInt(form.laborInsurance) || 0) + (parseInt(form.healthInsurance) || 0) + (parseInt(form.otherDeduction) || 0) + deductionTotal;
  const editNetPay = editTotalEarnings - editTotalDeductions;

  // 檢視模式日薪計算
  const viewBaseSalary = record ? Number(record.baseSalary) : 0;
  const viewDailyWage = viewBaseSalary > 0 ? Math.round(viewBaseSalary / 30) : 0;
  const viewPayDays = record?.payDays || 0;
  const viewMonthLastDay = record ? new Date((record.year + 1911), record.month, 0).getDate() : 30;
  const viewIsFullMonth = viewPayDays >= viewMonthLastDay;

  const renderField = (label: string, field: string) => (
    <div key={field}>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input type="number" value={(form as Record<string, string>)[field]} onChange={(e) => setForm(f => ({ ...f, [field]: e.target.value }))} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/salary" className="text-sm text-blue-600 hover:text-blue-800">← 返回薪資管理</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{record.employeeName} — {record.year}年{record.month}月薪資</h1>
        </div>
        <div className="flex gap-3">
          {!editing ? (
            <>
              <button onClick={startEditing} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">編輯</button>
              <button onClick={() => window.open(`/admin/salary/${id}/print`, "_blank")} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">查看薪資條</button>
              <button onClick={async () => { if (!confirm("確定刪除？")) return; await fetch(`/api/admin/salary/${id}`, { method: "DELETE" }); router.push("/admin/salary"); }} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">刪除</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">取消</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{saving ? "儲存中..." : "儲存"}</button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        /* ===== 編輯模式 ===== */
        <div className="space-y-5">
          {/* 基本資訊 */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-base font-bold text-gray-900 mb-3">基本資訊</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
            {editBaseSalary > 0 && editPayDays > 0 && (
              <div className="text-xs text-gray-500 mb-3 bg-blue-50 px-3 py-2 rounded space-y-0.5">
                <p>日薪：<span className="font-medium text-gray-700">${editDailyWage.toLocaleString()}</span>（底薪 ${editBaseSalary.toLocaleString()} ÷ 30 天）</p>
                {editIsFullMonth ? (
                  <p>足月，應領底薪：<span className="font-medium text-gray-700">${editBaseSalary.toLocaleString()}</span></p>
                ) : (
                  <p>不足月，應領底薪：<span className="font-medium text-gray-700">${editActualBasePay.toLocaleString()}</span>（日薪 ${editDailyWage.toLocaleString()} × {form.payDays} 天）</p>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {renderField("基本薪資", "baseSalary")}
              <div>
                <label className="block text-xs text-gray-500 mb-1">請假日數說明</label>
                <input value={form.leaveDays} onChange={(e) => setForm(f => ({ ...f, leaveDays: e.target.value }))} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
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
              <span className="text-gray-600">應領合計：</span><span className="font-bold text-gray-900">${editTotalEarnings.toLocaleString()}</span>
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
              <span className="text-gray-600">應扣合計：</span><span className="font-bold text-red-600">${editTotalDeductions.toLocaleString()}</span>
            </div>
          </div>

          {/* 備註 */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-xs text-gray-500 mb-1">備註</label>
            <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* 實領 */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5 text-right">
            <span className="text-lg font-bold text-gray-900">實領金額：${editNetPay.toLocaleString()}</span>
          </div>
        </div>
      ) : (
        /* ===== 檢視模式 ===== */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 應領 */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-base font-bold text-gray-900 mb-3">應領薪資金額</h2>
            {viewBaseSalary > 0 && viewPayDays > 0 && !viewIsFullMonth && (
              <div className="text-xs text-gray-500 mb-3 bg-blue-50 px-3 py-2 rounded space-y-0.5">
                <p>日薪：${viewDailyWage.toLocaleString()}（底薪 ${viewBaseSalary.toLocaleString()} ÷ 30 天）</p>
                <p>不足月，應領底薪：<span className="font-medium text-gray-700">${(viewDailyWage * viewPayDays).toLocaleString()}</span>（日薪 ${viewDailyWage.toLocaleString()} × {viewPayDays} 天）</p>
              </div>
            )}
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">基本薪資</dt><dd>${n(record.baseSalary)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">計薪日</dt><dd>共{record.payDays}日</dd></div>
              {record.leaveDays && <div className="flex justify-between"><dt className="text-gray-500">請假日數</dt><dd className="text-xs text-gray-500">{record.leaveDays}</dd></div>}
              {Number(record.leaveDeduction) > 0 && <div className="flex justify-between"><dt className="text-gray-500">請假扣款</dt><dd className="text-red-600">-${n(record.leaveDeduction)}</dd></div>}
              {Number(record.overtimePay) > 0 && <div className="flex justify-between"><dt className="text-gray-500">加班費</dt><dd>${n(record.overtimePay)}</dd></div>}
              {Number(record.fullAttendanceBonus) > 0 && <div className="flex justify-between"><dt className="text-gray-500">全勤獎金</dt><dd>${n(record.fullAttendanceBonus)}</dd></div>}
              {Number(record.supervisorAllowance) > 0 && <div className="flex justify-between"><dt className="text-gray-500">主管加給</dt><dd>${n(record.supervisorAllowance)}</dd></div>}
              {record.bonuses.map(b => (
                <div key={b.id} className="flex justify-between"><dt className="text-gray-500">{b.name}</dt><dd>${n(b.amount)}</dd></div>
              ))}
              <div className="flex justify-between pt-2 border-t border-gray-200 font-medium"><dt>應領合計</dt><dd>${n(record.totalEarnings)}</dd></div>
            </dl>
          </div>

          {/* 應扣 */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-base font-bold text-gray-900 mb-3">應扣金額</h2>
            <dl className="space-y-2 text-sm">
              {Number(record.laborInsurance) > 0 && <div className="flex justify-between"><dt className="text-gray-500">勞保費</dt><dd>${n(record.laborInsurance)}</dd></div>}
              {Number(record.healthInsurance) > 0 && <div className="flex justify-between"><dt className="text-gray-500">健保費</dt><dd>${n(record.healthInsurance)}</dd></div>}
              {Number(record.otherDeduction) > 0 && <div className="flex justify-between"><dt className="text-gray-500">其他扣款</dt><dd>${n(record.otherDeduction)}</dd></div>}
              {(record.deductions || []).map(d => (
                <div key={d.id} className="flex justify-between"><dt className="text-gray-500">{d.name}</dt><dd>${n(d.amount)}</dd></div>
              ))}
              <div className="flex justify-between pt-2 border-t border-gray-200 font-medium"><dt>應扣合計</dt><dd className="text-red-600">${n(record.totalDeductions)}</dd></div>
            </dl>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-lg font-bold">
                <span>實領金額</span>
                <span>${n(record.netPay)}</span>
              </div>
            </div>

            {record.note && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">備註</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{record.note}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
