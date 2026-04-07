"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface ItemRow { name: string; amount: string; }
interface Record {
  employeeName: string | null; department: string | null; jobGrade: string | null; jobTitle: string | null;
  year: number; month: number; workPeriodStart: string | null; workPeriodEnd: string | null; payDays: number | null;
  baseSalary: string; leaveDays: string | null; leaveDeduction: string;
  overtimePay: string; fullAttendanceBonus: string; supervisorAllowance: string;
  laborInsurance: string; healthInsurance: string;
  otherDeduction: string; totalEarnings: string; totalDeductions: string; netPay: string;
  bonuses: ItemRow[]; deductions: ItemRow[];
}

function SalarySlip({ r, companyName }: { r: Record; companyName: string }) {
  const fmt = (v: string | number) => {
    const num = Number(v);
    return num > 0 ? `$ ${num.toLocaleString()}` : "";
  };

  const earnRows: { label: string; value: string }[] = [
    { label: "基本薪資", value: `$ ${Number(r.baseSalary).toLocaleString()}` },
  ];
  if (Number(r.leaveDeduction) > 0) earnRows.push({ label: "請假扣款", value: `- ${fmt(r.leaveDeduction)}` });
  if (Number(r.overtimePay) > 0) earnRows.push({ label: "加班費", value: fmt(r.overtimePay) });
  (r.bonuses || []).forEach(b => earnRows.push({ label: b.name, value: `$ ${Number(b.amount).toLocaleString()}` }));
  if (Number(r.fullAttendanceBonus) > 0) earnRows.push({ label: "全勤獎金", value: fmt(r.fullAttendanceBonus) });
  if (Number(r.supervisorAllowance) > 0) earnRows.push({ label: "主管加給", value: fmt(r.supervisorAllowance) });

  const deductRows: { label: string; value: string }[] = [];
  if (Number(r.laborInsurance) > 0) deductRows.push({ label: "勞保費", value: fmt(r.laborInsurance) });
  if (Number(r.healthInsurance) > 0) deductRows.push({ label: "健保費", value: fmt(r.healthInsurance) });
  if (Number(r.otherDeduction) > 0) deductRows.push({ label: "其他扣款", value: fmt(r.otherDeduction) });
  (r.deductions || []).forEach(d => deductRows.push({ label: d.name, value: `$ ${Number(d.amount).toLocaleString()}` }));

  const cell = "border border-gray-300 px-1 py-0.5";

  return (
    <div className="border border-gray-400 text-[11px] leading-tight" style={{ width: "48%", pageBreakInside: "avoid" }}>
      <div className="px-2 pt-2 pb-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold text-sm">員工薪資表</p>
            <p>月份：{r.year}年{r.month}月</p>
            <p>單位：{r.department || ""}</p>
            <p>工作期間：{r.workPeriodStart || `${r.month}/1`}～{r.workPeriodEnd || `${r.month}/28`}</p>
          </div>
          <p className="text-[10px] text-gray-500">{companyName}</p>
        </div>
      </div>
      <table className="w-full border-collapse">
        <tbody>
          <tr><td className={`${cell} bg-gray-50`} colSpan={2}>職　等</td><td className={cell} colSpan={2}>{r.jobGrade || ""}</td></tr>
          <tr><td className={`${cell} bg-gray-50`} colSpan={2}>職　位</td><td className={cell} colSpan={2}>{r.jobTitle || ""}</td></tr>
          <tr><td className={`${cell} bg-gray-50`} colSpan={2}>姓　名</td><td className={`${cell} bg-yellow-100 font-medium`} colSpan={2}>{r.employeeName}</td></tr>

          {earnRows.map((row, i) => (
            <tr key={`e-${i}`}>
              {i === 0 && <td className={`${cell} bg-gray-50 w-[15%] text-center align-middle`} rowSpan={earnRows.length + 2}>應<br/>領<br/>薪<br/>資</td>}
              <td className={cell}>{row.label}</td>
              <td className={`${cell} text-right`} colSpan={2}>{row.value}</td>
            </tr>
          ))}
          <tr>
            <td className={cell}>計薪日</td>
            <td className={`${cell} text-right`} colSpan={2}>共{r.payDays}日</td>
          </tr>
          <tr>
            <td className={cell}>請假日數</td>
            <td className={`${cell} text-right text-[9px]`} colSpan={2}>{r.leaveDays || ""}</td>
          </tr>
          <tr className="bg-blue-50">
            <td className={`${cell} font-medium`} colSpan={2}>應領合計</td>
            <td className={`${cell} text-right font-medium`} colSpan={2}>$ {Number(r.totalEarnings).toLocaleString()}</td>
          </tr>

          {deductRows.map((row, i) => (
            <tr key={`d-${i}`}>
              {i === 0 && <td className={`${cell} bg-gray-50 w-[15%] text-center align-middle`} rowSpan={deductRows.length}>應<br/>扣<br/>金<br/>額</td>}
              <td className={cell}>{row.label}</td>
              <td className={`${cell} text-right`} colSpan={2}>{row.value}</td>
            </tr>
          ))}
          {deductRows.length === 0 && (
            <tr>
              <td className={`${cell} bg-gray-50 w-[15%] text-center`}>應扣</td>
              <td className={cell}>（無）</td>
              <td className={`${cell} text-right`} colSpan={2}></td>
            </tr>
          )}
          <tr className="bg-red-50">
            <td className={`${cell} font-medium`} colSpan={2}>應扣合計</td>
            <td className={`${cell} text-right font-medium`} colSpan={2}>$ {Number(r.totalDeductions).toLocaleString()}</td>
          </tr>

          <tr className="bg-yellow-50 font-bold">
            <td className={cell} colSpan={2}>實領金額</td>
            <td className={`${cell} text-right bg-yellow-100`} colSpan={2}>$ {Number(r.netPay).toLocaleString()}</td>
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
