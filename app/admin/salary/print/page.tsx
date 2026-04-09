"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface ItemRow { name: string; amount: string; }
interface SalaryRecord {
  id: string; employeeName: string | null; department: string | null; jobGrade: string | null; jobTitle: string | null;
  year: number; month: number; workPeriodStart: string | null; workPeriodEnd: string | null; payDays: number | null;
  baseSalary: string; leaveDays: string | null; leaveDeduction: string;
  overtimePay: string; fullAttendanceBonus: string; supervisorAllowance: string;
  laborInsurance: string; healthInsurance: string;
  otherDeduction: string; totalEarnings: string; totalDeductions: string; netPay: string;
  note: string | null; bonuses: ItemRow[]; deductions: ItemRow[];
}

function fmtPeriod(r: SalaryRecord) {
  const parse = (d: string | null) => {
    if (!d) return null;
    const date = new Date(d);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };
  const start = parse(r.workPeriodStart) || `${r.month}月1日`;
  const end = parse(r.workPeriodEnd) || `${r.month}月28日`;
  return `${r.year}年${start}～${end}`;
}

function SalarySlip({ r, showSignature }: { r: SalaryRecord; showSignature: boolean }) {
  const n = (v: string | number) => Number(v) > 0 ? Number(v).toLocaleString() : "";
  const c = "border border-gray-400 px-1.5 py-0.5";
  const cr = `${c} text-right`;

  // 應領項目
  const earn: { label: string; $?: boolean; val: string }[] = [
    { label: "基本薪資", $: true, val: Number(r.baseSalary).toLocaleString() },
    { label: "計薪日", val: `共${r.payDays || 0}日` },
    { label: "請假日數", val: r.leaveDays || "" },
  ];
  if (Number(r.overtimePay) > 0) earn.push({ label: "加班費", $: true, val: n(r.overtimePay) });
  (r.bonuses || []).forEach(b => { if (Number(b.amount) > 0) earn.push({ label: b.name, $: true, val: n(b.amount) }); });
  if (Number(r.fullAttendanceBonus) > 0) earn.push({ label: "全勤獎金", $: true, val: n(r.fullAttendanceBonus) });
  if (Number(r.supervisorAllowance) > 0) earn.push({ label: "主管加給", $: true, val: n(r.supervisorAllowance) });

  // 應扣項目
  const deduct: { label: string; $?: boolean; val: string }[] = [];
  if (Number(r.laborInsurance) > 0) deduct.push({ label: "勞保費", $: true, val: n(r.laborInsurance) });
  if (Number(r.healthInsurance) > 0) deduct.push({ label: "健保費", $: true, val: n(r.healthInsurance) });
  deduct.push({ label: "常年會費", val: "" });
  if (Number(r.otherDeduction) > 0) deduct.push({ label: "其他扣款", $: true, val: n(r.otherDeduction) });
  (r.deductions || []).forEach(d => { if (Number(d.amount) > 0) deduct.push({ label: d.name, $: true, val: n(d.amount) }); });

  return (
    <div style={{ width: "48%", pageBreakInside: "avoid", fontSize: "10px", lineHeight: "1.4" }}>
      {/* Header */}
      <div className="flex justify-between items-start" style={{ marginBottom: "2px" }}>
        <div>
          <p className="font-bold" style={{ fontSize: "12px" }}>員工薪資表</p>
          <p>月份：{r.year}年{r.month}月</p>
          <p>單位：{r.department || ""}</p>
          <p>工作期間：{fmtPeriod(r)}</p>
        </div>
        {showSignature && <p className="text-gray-500" style={{ fontSize: "9px" }}>公司留抵</p>}
      </div>

      {/* Table */}
      <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: "10%" }} />
          <col style={{ width: "38%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "44%" }} />
        </colgroup>
        <tbody>
          {/* 基本資料 */}
          <tr>
            <td className={c} colSpan={2}>職等</td>
            <td className={c} colSpan={2}>{r.jobGrade || ""}</td>
          </tr>
          <tr>
            <td className={c} colSpan={2}>職位</td>
            <td className={c} colSpan={2}>{r.jobTitle || ""}</td>
          </tr>
          <tr>
            <td className={c} colSpan={2}>姓名</td>
            <td className={`${c} font-bold`} colSpan={2}>{r.employeeName}</td>
          </tr>

          {/* 應領薪資金額 */}
          {earn.map((item, i) => (
            <tr key={`e${i}`}>
              {i === 0 && (
                <td className={`${c} bg-gray-50 text-center align-middle`} rowSpan={earn.length} style={{ writingMode: "vertical-rl", letterSpacing: "2px", fontSize: "9px" }}>
                  應領薪資金額
                </td>
              )}
              <td className={c}>{item.label}</td>
              {item.$ ? (
                <><td className={cr}>$</td><td className={cr}>{item.val}</td></>
              ) : (
                <td className={cr} colSpan={2}>{item.val}</td>
              )}
            </tr>
          ))}

          {/* 應扣金額 */}
          {deduct.map((item, i) => (
            <tr key={`d${i}`}>
              {i === 0 && (
                <td className={`${c} bg-gray-50 text-center align-middle`} rowSpan={deduct.length} style={{ writingMode: "vertical-rl", letterSpacing: "2px", fontSize: "9px" }}>
                  應扣金額
                </td>
              )}
              <td className={c}>{item.label}</td>
              {item.$ ? (
                <><td className={cr}>$</td><td className={cr}>{item.val}</td></>
              ) : (
                <td className={cr} colSpan={2}>{item.val}</td>
              )}
            </tr>
          ))}

          {/* 合計 / 實領 / 總計 */}
          <tr>
            <td className={c} colSpan={2}>合計</td>
            <td className={cr} colSpan={2}></td>
          </tr>
          <tr>
            <td className={c} colSpan={2}>實領金額</td>
            <td className={cr}>$</td>
            <td className={`${cr} font-bold`}>{Number(r.netPay).toLocaleString()}</td>
          </tr>
          <tr className="font-bold">
            <td className={c} colSpan={2}>總計</td>
            <td className={cr}>$</td>
            <td className={cr}>{Number(r.netPay).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      {/* 備註 */}
      {r.note && (
        <div style={{ fontSize: "9px", marginTop: "4px" }}>
          <p className="font-medium text-gray-700" style={{ marginBottom: "1px" }}>備註</p>
          <p className="text-gray-600 whitespace-pre-wrap">{r.note}</p>
        </div>
      )}

      {/* 簽名欄 */}
      {showSignature && (
        <div style={{ fontSize: "9px", marginTop: "8px" }}>
          <p>領薪簽章：</p>
          <div className="flex justify-between" style={{ marginTop: "12px" }}>
            <p>核准主管：</p>
            <p>製表：</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SalaryBatchPrintPage() {
  const searchParams = useSearchParams();
  const year = searchParams.get("year") || "";
  const month = searchParams.get("month") || "";
  const [records, setRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!year) return;
    const params = new URLSearchParams({ year });
    if (month) params.set("month", month);
    fetch(`/api/admin/salary?${params}`).then(r => r.json()).then(async (d) => {
      const full = await Promise.all(
        (d.data || []).map(async (rec: SalaryRecord) => {
          const detail = await fetch(`/api/admin/salary/${rec.id}`).then(res => res.json());
          return { ...rec, ...detail, bonuses: detail.bonuses || [], deductions: detail.deductions || [] };
        })
      );
      setRecords(full);
      setLoading(false);
      document.title = `${year}年${month ? month + "月" : ""}薪資條`;
    });
  }, [year, month]);

  if (loading) return <div className="p-8 text-center text-gray-400">載入中...</div>;

  return (
    <>
      <style jsx global>{`
        @media print { body { margin: 0; } .no-print { display: none !important; } @page { margin: 8mm; size: A4; } }
        @media screen { body { background: #f3f4f6; } }
      `}</style>
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-lg">列印</button>
        <button onClick={() => window.close()} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 shadow-lg">關閉</button>
      </div>
      <div className="max-w-[210mm] mx-auto bg-white p-4 sm:my-6 sm:shadow-lg print:p-0 print:shadow-none" style={{ fontFamily: "'Noto Sans TC', 'Microsoft JhengHei', sans-serif" }}>
        <h2 className="text-center font-bold text-base mb-3">{year}-{month}月份</h2>
        <div className="space-y-6">
          {records.map(r => (
            <div key={r.id} className="flex justify-between" style={{ pageBreakInside: "avoid" }}>
              <SalarySlip r={r} showSignature={false} />
              <SalarySlip r={r} showSignature={true} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
