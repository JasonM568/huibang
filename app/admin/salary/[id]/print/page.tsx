"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Bonus { name: string; amount: string; }
interface Record {
  employeeName: string | null; department: string | null; jobGrade: string | null; jobTitle: string | null;
  year: number; month: number; workPeriodStart: string | null; workPeriodEnd: string | null; payDays: number | null;
  baseSalary: string; leaveDays: string | null; leaveDeduction: string;
  overtimePay: string; fullAttendanceBonus: string; supervisorAllowance: string;
  laborInsurance: string; healthInsurance: string;
  otherDeduction: string; totalEarnings: string; totalDeductions: string; netPay: string;
  bonuses: Bonus[];
}

function SalarySlip({ r, companyName }: { r: Record; companyName: string }) {
  const n = (v: string) => Number(v) > 0 ? `$ ${Number(v).toLocaleString()}` : "";
  return (
    <div className="border border-gray-400 text-[11px] leading-tight" style={{ width: "48%", pageBreakInside: "avoid" }}>
      <div className="px-2 pt-2 pb-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold text-sm">員工薪資表</p>
            <p>月份：{r.year}年{r.month}月</p>
            <p>單位：{r.department || ""}</p>
            <p>工作期間：{r.year}年{r.workPeriodStart || `${r.month}/1`}～{r.workPeriodEnd || `${r.month}/28`}</p>
          </div>
          <p className="text-[10px] text-gray-500">{companyName}</p>
        </div>
      </div>
      <table className="w-full border-collapse">
        <tbody>
          <tr><td className="border border-gray-300 px-1 py-0.5 bg-gray-50" colSpan={2}>職　等</td><td className="border border-gray-300 px-1 py-0.5" colSpan={2}>{r.jobGrade || ""}</td></tr>
          <tr><td className="border border-gray-300 px-1 py-0.5 bg-gray-50" colSpan={2}>職　位</td><td className="border border-gray-300 px-1 py-0.5" colSpan={2}>{r.jobTitle || ""}</td></tr>
          <tr><td className="border border-gray-300 px-1 py-0.5 bg-gray-50" colSpan={2}>姓　名</td><td className="border border-gray-300 px-1 py-0.5 bg-yellow-100 font-medium" colSpan={2}>{r.employeeName}</td></tr>
          <tr>
            <td className="border border-gray-300 px-1 py-0.5 bg-gray-50 w-[15%]" rowSpan={6 + r.bonuses.length + (Number(r.leaveDeduction) > 0 ? 1 : 0) + (Number(r.overtimePay) > 0 ? 1 : 0)}>應<br/>領<br/>薪<br/>資<br/>金<br/>額</td>
            <td className="border border-gray-300 px-1 py-0.5">基本薪資</td>
            <td className="border border-gray-300 px-1 py-0.5 text-right">$</td>
            <td className="border border-gray-300 px-1 py-0.5 text-right bg-yellow-100">{Number(r.baseSalary).toLocaleString()}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-1 py-0.5">計薪日</td>
            <td className="border border-gray-300 px-1 py-0.5 text-right" colSpan={2}>共{r.payDays}日</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-1 py-0.5">請假日數</td>
            <td className="border border-gray-300 px-1 py-0.5 text-right text-[9px]" colSpan={2}>{r.leaveDays || ""}</td>
          </tr>
          {Number(r.leaveDeduction) > 0 && (
            <tr><td className="border border-gray-300 px-1 py-0.5">請假扣款</td><td className="border border-gray-300 px-1 py-0.5 text-right" colSpan={2}>{n(r.leaveDeduction)}</td></tr>
          )}
          {Number(r.overtimePay) > 0 && (
            <tr><td className="border border-gray-300 px-1 py-0.5">加班費</td><td className="border border-gray-300 px-1 py-0.5 text-right" colSpan={2}>{n(r.overtimePay)}</td></tr>
          )}
          {r.bonuses.map((b, i) => (
            <tr key={i}><td className="border border-gray-300 px-1 py-0.5">{b.name}</td><td className="border border-gray-300 px-1 py-0.5 text-right">$</td><td className="border border-gray-300 px-1 py-0.5 text-right">{Number(b.amount).toLocaleString()}</td></tr>
          ))}
          {Number(r.fullAttendanceBonus) > 0 && (
            <tr><td className="border border-gray-300 px-1 py-0.5">全勤獎金</td><td className="border border-gray-300 px-1 py-0.5 text-right">$</td><td className="border border-gray-300 px-1 py-0.5 text-right">{Number(r.fullAttendanceBonus).toLocaleString()}</td></tr>
          )}
          {Number(r.supervisorAllowance) > 0 && (
            <tr><td className="border border-gray-300 px-1 py-0.5">主管加給</td><td className="border border-gray-300 px-1 py-0.5 text-right">$</td><td className="border border-gray-300 px-1 py-0.5 text-right">{Number(r.supervisorAllowance).toLocaleString()}</td></tr>
          )}

          <tr>
            <td className="border border-gray-300 px-1 py-0.5 bg-gray-50" rowSpan={3}>應<br/>扣<br/>金<br/>額</td>
            <td className="border border-gray-300 px-1 py-0.5">勞保費</td>
            <td className="border border-gray-300 px-1 py-0.5 text-right" colSpan={2}>{n(r.laborInsurance)}</td>
          </tr>
          <tr><td className="border border-gray-300 px-1 py-0.5">健保費</td><td className="border border-gray-300 px-1 py-0.5 text-right" colSpan={2}>{n(r.healthInsurance)}</td></tr>
          <tr>
            <td className="border border-gray-300 px-1 py-0.5">合計</td>
            <td className="border border-gray-300 px-1 py-0.5" colSpan={2}></td>
          </tr>

          <tr className="bg-gray-50">
            <td className="border border-gray-300 px-1 py-0.5" colSpan={2}>實領金額</td>
            <td className="border border-gray-300 px-1 py-1 text-right font-bold bg-yellow-100" colSpan={2}>$ {Number(r.netPay).toLocaleString()}</td>
          </tr>
          <tr className="font-bold">
            <td className="border border-gray-300 px-1 py-1" colSpan={2}>總計</td>
            <td className="border border-gray-300 px-1 py-1 text-right" colSpan={2}>$ {Number(r.netPay).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function SalaryPrintPage() {
  const { id } = useParams();
  const [record, setRecord] = useState<Record | null>(null);

  useEffect(() => {
    fetch(`/api/admin/salary/${id}`).then(r => r.json()).then(d => { setRecord(d); document.title = `薪資條_${d.employeeName}_${d.year}年${d.month}月`; });
  }, [id]);

  if (!record) return <div className="p-8 text-center text-gray-400">載入中...</div>;

  return (
    <>
      <style jsx global>{`
        @media print { body { margin: 0; } .no-print { display: none !important; } @page { margin: 10mm; size: A4; } }
        @media screen { body { background: #f3f4f6; } }
      `}</style>
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-lg">列印</button>
        <button onClick={() => window.close()} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 shadow-lg">關閉</button>
      </div>
      <div className="max-w-[210mm] mx-auto bg-white p-6 sm:my-6 sm:shadow-lg print:p-0 print:shadow-none" style={{ fontFamily: "'Noto Sans TC', 'Microsoft JhengHei', sans-serif" }}>
        <h2 className="text-center font-bold text-base mb-4">{record.year}-{record.month}月份</h2>
        <div className="flex flex-wrap gap-[2%]">
          <SalarySlip r={record} companyName="惠邦創意整合行銷有限公司" />
        </div>
      </div>
    </>
  );
}
