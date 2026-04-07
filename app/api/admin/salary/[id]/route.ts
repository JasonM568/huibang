import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { salaryRecords, salaryBonuses, salaryDeductions, employees } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const [record] = await db
      .select({
        id: salaryRecords.id,
        employeeId: salaryRecords.employeeId,
        employeeName: employees.name,
        department: employees.department,
        jobTitle: employees.jobTitle,
        jobGrade: employees.jobGrade,
        year: salaryRecords.year,
        month: salaryRecords.month,
        workPeriodStart: salaryRecords.workPeriodStart,
        workPeriodEnd: salaryRecords.workPeriodEnd,
        payDays: salaryRecords.payDays,
        baseSalary: salaryRecords.baseSalary,
        leaveDays: salaryRecords.leaveDays,
        leaveDeduction: salaryRecords.leaveDeduction,
        overtimePay: salaryRecords.overtimePay,
        fullAttendanceBonus: salaryRecords.fullAttendanceBonus,
        supervisorAllowance: salaryRecords.supervisorAllowance,
        laborInsurance: salaryRecords.laborInsurance,
        healthInsurance: salaryRecords.healthInsurance,
        otherDeduction: salaryRecords.otherDeduction,
        otherDeductionNote: salaryRecords.otherDeductionNote,
        totalEarnings: salaryRecords.totalEarnings,
        totalDeductions: salaryRecords.totalDeductions,
        netPay: salaryRecords.netPay,
        note: salaryRecords.note,
        createdAt: salaryRecords.createdAt,
      })
      .from(salaryRecords)
      .leftJoin(employees, eq(salaryRecords.employeeId, employees.id))
      .where(eq(salaryRecords.id, id));

    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const bonuses = await db.select().from(salaryBonuses).where(eq(salaryBonuses.salaryRecordId, id));
    const deductions = await db.select().from(salaryDeductions).where(eq(salaryDeductions.salaryRecordId, id));

    return NextResponse.json({ ...record, bonuses, deductions });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const bonuses = body.bonuses;
    const deductions = body.deductions;

    if (bonuses !== undefined) {
      // 破月計算：日薪 = 足月應領總額 / 30
      const baseSalary = parseInt(body.baseSalary) || 0;
      const payDays = parseInt(body.payDays) || 0;
      const year = parseInt(body.year) || 0;
      const month = parseInt(body.month) || 0;
      const monthLastDay = year > 0 && month > 0 ? new Date(year + 1911, month, 0).getDate() : 30;
      const isFullMonth = payDays >= monthLastDay;

      const bonusTotal = bonuses.reduce((s: number, b: { amount: string }) => s + (parseInt(b.amount) || 0), 0);
      const deductionTotal = (deductions || []).reduce((s: number, d: { amount: string }) => s + (parseInt(d.amount) || 0), 0);
      const fullMonthEarnings = baseSalary
        - (parseInt(body.leaveDeduction) || 0)
        + (parseInt(body.overtimePay) || 0)
        + (parseInt(body.fullAttendanceBonus) || 0)
        + (parseInt(body.supervisorAllowance) || 0)
        + bonusTotal;

      const dailyWage = fullMonthEarnings > 0 ? Math.round(fullMonthEarnings / 30) : 0;
      const totalEarnings = isFullMonth ? fullMonthEarnings : dailyWage * payDays;
      const totalDeductions = (parseInt(body.laborInsurance) || 0)
        + (parseInt(body.healthInsurance) || 0)
        + (parseInt(body.otherDeduction) || 0)
        + deductionTotal;
      const netPay = totalEarnings - totalDeductions;

      const { bonuses: _b, deductions: _d, ...recordData } = body;
      await db.update(salaryRecords).set({
        ...recordData,
        totalEarnings: totalEarnings.toString(),
        totalDeductions: totalDeductions.toString(),
        netPay: netPay.toString(),
        updatedAt: new Date(),
      }).where(eq(salaryRecords.id, id));

      // Replace bonuses
      await db.delete(salaryBonuses).where(eq(salaryBonuses.salaryRecordId, id));
      if (bonuses.length > 0) {
        await db.insert(salaryBonuses).values(
          bonuses.map((b: { name: string; amount: string }) => ({
            salaryRecordId: id,
            name: b.name,
            amount: b.amount || "0",
          }))
        );
      }

      // Replace deductions
      if (deductions !== undefined) {
        await db.delete(salaryDeductions).where(eq(salaryDeductions.salaryRecordId, id));
        if (deductions.length > 0) {
          await db.insert(salaryDeductions).values(
            deductions.map((d: { name: string; amount: string }) => ({
              salaryRecordId: id,
              name: d.name,
              amount: d.amount || "0",
            }))
          );
        }
      }
    } else {
      await db.update(salaryRecords).set({ ...body, updatedAt: new Date() }).where(eq(salaryRecords.id, id));
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    await db.delete(salaryRecords).where(eq(salaryRecords.id, id));
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
