"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Bonus { id: string; name: string; amount: string; }
interface SalaryDetail {
  id: string; employeeName: string | null; department: string | null; jobTitle: string | null; jobGrade: string | null;
  year: number; month: number; workPeriodStart: string | null; workPeriodEnd: string | null; payDays: number | null;
  baseSalary: string; leaveDays: string | null; leaveDeduction: string;
  overtimePay: string; fullAttendanceBonus: string; supervisorAllowance: string;
  laborInsurance: string; healthInsurance: string; employmentInsurance: string; annualDues: string;
  otherDeduction: string; otherDeductionNote: string | null;
  totalEarnings: string; totalDeductions: string; netPay: string;
  note: string | null; bonuses: Bonus[];
}

export default function SalaryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<SalaryDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/salary/${id}`).then(r => r.json()).then(d => { setRecord(d); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-center py-12 text-gray-400">載入中...</div>;
  if (!record) return <div className="text-center py-12 text-gray-400">找不到紀錄</div>;

  const n = (v: string) => Number(v).toLocaleString();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/salary" className="text-sm text-blue-600 hover:text-blue-800">← 返回薪資管理</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{record.employeeName} — {record.year}年{record.month}月薪資</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.open(`/admin/salary/${id}/print`, "_blank")} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">查看薪資條</button>
          <button onClick={async () => { if (!confirm("確定刪除？")) return; await fetch(`/api/admin/salary/${id}`, { method: "DELETE" }); router.push("/admin/salary"); }} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">刪除</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 應領 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-bold text-gray-900 mb-3">應領薪資金額</h2>
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
            {Number(record.employmentInsurance) > 0 && <div className="flex justify-between"><dt className="text-gray-500">就保費</dt><dd>${n(record.employmentInsurance)}</dd></div>}
            {Number(record.laborInsurance) > 0 && <div className="flex justify-between"><dt className="text-gray-500">勞保費</dt><dd>${n(record.laborInsurance)}</dd></div>}
            {Number(record.healthInsurance) > 0 && <div className="flex justify-between"><dt className="text-gray-500">健保費</dt><dd>${n(record.healthInsurance)}</dd></div>}
            {Number(record.annualDues) > 0 && <div className="flex justify-between"><dt className="text-gray-500">常年會費</dt><dd>${n(record.annualDues)}</dd></div>}
            {Number(record.otherDeduction) > 0 && <div className="flex justify-between"><dt className="text-gray-500">其他扣款</dt><dd>${n(record.otherDeduction)}</dd></div>}
            <div className="flex justify-between pt-2 border-t border-gray-200 font-medium"><dt>應扣合計</dt><dd className="text-red-600">${n(record.totalDeductions)}</dd></div>
          </dl>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-lg font-bold">
              <span>實領金額</span>
              <span>${n(record.netPay)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
