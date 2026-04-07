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
  note: string | null; bonuses: ItemRow[]; deductions: ItemRow[];
}

function SalarySlip({ r, companyName, showSignature }: { r: Record; companyName: string; showSignature: boolean }) {
  const amt = (v: string | number) => Number(v) > 0 ? Number(v).toLocaleString() : "";
  const cell = "border border-gray-400 px-2 py-1";
  const cellR = `${cell} text-right`;
  const sectionHeader = `${cell} bg-gray-100 text-center align-middle font-medium`;

  // 應領項目
  const earnItems: { label: string; dollar?: boolean; value: string }[] = [];
  earnItems.push({ label: "基本薪資", dollar: true, value: Number(r.baseSalary).toLocaleString() });
  earnItems.push({ label: "計薪日", value: `共${r.payDays || 0}日` });
  earnItems.push({ label: "請假日數", value: r.leaveDays || "" });
  if (Number(r.leaveDeduction) > 0) earnItems.push({ label: "請假扣款", dollar: true, value: amt(r.leaveDeduction) });
  if (Number(r.overtimePay) > 0) earnItems.push({ label: "加班費", dollar: true, value: amt(r.overtimePay) });
  (r.bonuses || []).forEach(b => earnItems.push({ label: b.name, dollar: true, value: amt(b.amount) }));
  if (Number(r.fullAttendanceBonus) > 0) earnItems.push({ label: "全勤獎金", dollar: true, value: amt(r.fullAttendanceBonus) });
  if (Number(r.supervisorAllowance) > 0) earnItems.push({ label: "主管加給", dollar: true, value: amt(r.supervisorAllowance) });

  // 應扣項目
  const deductItems: { label: string; dollar?: boolean; value: string }[] = [];
  if (Number(r.laborInsurance) > 0) deductItems.push({ label: "就保費", dollar: true, value: amt(r.laborInsurance) });
  deductItems.push({ label: "勞保費", value: "" });
  deductItems.push({ label: "健保費", value: "" });
  deductItems.push({ label: "常年會費", value: "" });
  if (Number(r.otherDeduction) > 0) deductItems.push({ label: "其他扣款", dollar: true, value: amt(r.otherDeduction) });
  (r.deductions || []).forEach(d => deductItems.push({ label: d.name, dollar: true, value: amt(d.amount) }));

  return (
    <div style={{ width: "48%", pageBreakInside: "avoid", fontSize: "11px", lineHeight: "1.4" }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-1">
        <div>
          <p className="font-bold text-sm">員工薪資表</p>
          <p>月份：{r.year}年{r.month}月</p>
          <p>單位：{r.department || ""}</p>
          <p>工作期間：{r.year}年{r.workPeriodStart ? new Date(r.workPeriodStart).getMonth() + 1 + "月" + new Date(r.workPeriodStart).getDate() + "日" : `${r.month}月1日`}～{r.workPeriodEnd ? new Date(r.workPeriodEnd).getMonth() + 1 + "月" + new Date(r.workPeriodEnd).getDate() + "日" : `${r.month}月28日`}</p>
        </div>
        <p className="text-[10px] text-gray-500">{showSignature ? "公司留抵" : companyName}</p>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border border-gray-400">
        <tbody>
          <tr>
            <td className={cell} colSpan={2}>職　等</td>
            <td className={cell} colSpan={2}>{r.jobGrade || ""}</td>
          </tr>
          <tr>
            <td className={cell} colSpan={2}>職　位</td>
            <td className={cell} colSpan={2}>{r.jobTitle || ""}</td>
          </tr>
          <tr>
            <td className={cell} colSpan={2}>姓　名</td>
            <td className={`${cell} font-bold`} colSpan={2}>{r.employeeName}</td>
          </tr>

          {/* 應領薪資金額 */}
          {earnItems.map((item, i) => (
            <tr key={`e-${i}`}>
              {i === 0 && (
                <td className={sectionHeader} style={{ width: "14%" }} rowSpan={earnItems.length}>
                  應<br/>領<br/>薪<br/>資<br/>金<br/>額
                </td>
              )}
              <td className={cell}>{item.label}</td>
              {item.dollar ? (
                <>
                  <td className={cellR} style={{ width: "10%" }}>$</td>
                  <td className={cellR} style={{ width: "25%" }}>{item.value}</td>
                </>
              ) : (
                <td className={cellR} colSpan={2}>{item.value}</td>
              )}
            </tr>
          ))}

          {/* 應扣金額 */}
          {deductItems.map((item, i) => (
            <tr key={`d-${i}`}>
              {i === 0 && (
                <td className={sectionHeader} rowSpan={deductItems.length}>
                  應<br/>扣<br/>金<br/>額
                </td>
              )}
              <td className={cell}>{item.label}</td>
              {item.dollar ? (
                <>
                  <td className={cellR}>$</td>
                  <td className={cellR}>{item.value}</td>
                </>
              ) : (
                <td className={cellR} colSpan={2}>{item.value}</td>
              )}
            </tr>
          ))}

          {/* 合計 */}
          <tr>
            <td className={cell} colSpan={2}>合計</td>
            <td className={cellR} colSpan={2}></td>
          </tr>
          <tr>
            <td className={cell} colSpan={2}>實領金額</td>
            <td className={cellR}>$</td>
            <td className={`${cellR} font-bold bg-yellow-50`}>{Number(r.netPay).toLocaleString()}</td>
          </tr>
          <tr className="font-bold">
            <td className={cell} colSpan={2}>總計</td>
            <td className={cellR}>$</td>
            <td className={cellR}>{Number(r.netPay).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      {/* 備註 */}
      {r.note && (
        <p className="mt-1 text-[10px] text-gray-600">{r.note}</p>
      )}

      {/* 簽名欄（右邊員工聯） */}
      {showSignature && (
        <div className="mt-2 text-[10px]">
          <p>領薪簽章：</p>
          <div className="flex justify-between mt-4">
            <p>核准主管：</p>
            <p>製表：</p>
          </div>
        </div>
      )}
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
        <div className="flex justify-between">
          <SalarySlip r={record} companyName="惠邦創意整合行銷有限公司" showSignature={false} />
          <SalarySlip r={record} companyName="惠邦創意整合行銷有限公司" showSignature={true} />
        </div>
      </div>
    </>
  );
}
