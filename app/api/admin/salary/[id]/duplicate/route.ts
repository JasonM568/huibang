import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { salaryRecords, salaryBonuses, salaryDeductions } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { requireRestrictedAccess } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRestrictedAccess();
    const { id } = await params;

    const [source] = await db
      .select()
      .from(salaryRecords)
      .where(eq(salaryRecords.id, id));

    if (!source) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // 月份 +1，跨年自動進位
    let newYear = source.year;
    let newMonth = source.month + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }

    // 該員工該月若已有紀錄則擋下，避免重複
    const [existing] = await db
      .select({ id: salaryRecords.id })
      .from(salaryRecords)
      .where(
        and(
          eq(salaryRecords.employeeId, source.employeeId),
          eq(salaryRecords.year, newYear),
          eq(salaryRecords.month, newMonth)
        )
      );

    if (existing) {
      return NextResponse.json(
        { error: `${newYear}年${newMonth}月已有此員工的薪資紀錄，無法複製` },
        { status: 400 }
      );
    }

    const [record] = await db
      .insert(salaryRecords)
      .values({
        employeeId: source.employeeId,
        year: newYear,
        month: newMonth,
        workPeriodStart: source.workPeriodStart,
        workPeriodEnd: source.workPeriodEnd,
        payDays: source.payDays,
        baseSalary: source.baseSalary,
        leaveDays: source.leaveDays,
        leaveDeduction: source.leaveDeduction,
        overtimePay: source.overtimePay,
        fullAttendanceBonus: source.fullAttendanceBonus,
        supervisorAllowance: source.supervisorAllowance,
        laborInsurance: source.laborInsurance,
        healthInsurance: source.healthInsurance,
        otherDeduction: source.otherDeduction,
        otherDeductionNote: source.otherDeductionNote,
        totalEarnings: source.totalEarnings,
        totalDeductions: source.totalDeductions,
        netPay: source.netPay,
        note: source.note,
        internalNote: source.internalNote,
      })
      .returning();

    // 複製獎金子項目
    const sourceBonuses = await db
      .select()
      .from(salaryBonuses)
      .where(eq(salaryBonuses.salaryRecordId, id));
    if (sourceBonuses.length > 0) {
      await db.insert(salaryBonuses).values(
        sourceBonuses.map((b) => ({
          salaryRecordId: record.id,
          name: b.name,
          amount: b.amount,
        }))
      );
    }

    // 複製應扣子項目
    const sourceDeductions = await db
      .select()
      .from(salaryDeductions)
      .where(eq(salaryDeductions.salaryRecordId, id));
    if (sourceDeductions.length > 0) {
      await db.insert(salaryDeductions).values(
        sourceDeductions.map((d) => ({
          salaryRecordId: record.id,
          name: d.name,
          amount: d.amount,
        }))
      );
    }

    return NextResponse.json(
      { id: record.id, year: newYear, month: newMonth },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Duplicate salary error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
