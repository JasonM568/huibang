import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { salaryRecords, salaryBonuses, salaryDeductions, employees } from "@/lib/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const employeeId = searchParams.get("employeeId");

    const conditions = [];
    if (year) conditions.push(eq(salaryRecords.year, parseInt(year)));
    if (month) conditions.push(eq(salaryRecords.month, parseInt(month)));
    if (employeeId) conditions.push(eq(salaryRecords.employeeId, employeeId));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select({
        id: salaryRecords.id,
        employeeId: salaryRecords.employeeId,
        employeeName: employees.name,
        department: employees.department,
        jobTitle: employees.jobTitle,
        year: salaryRecords.year,
        month: salaryRecords.month,
        baseSalary: salaryRecords.baseSalary,
        totalEarnings: salaryRecords.totalEarnings,
        totalDeductions: salaryRecords.totalDeductions,
        netPay: salaryRecords.netPay,
        createdAt: salaryRecords.createdAt,
      })
      .from(salaryRecords)
      .leftJoin(employees, eq(salaryRecords.employeeId, employees.id))
      .where(where)
      .orderBy(desc(salaryRecords.year), desc(salaryRecords.month), employees.name);

    return NextResponse.json({ data });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Salary list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    const bonuses = body.bonuses || [];
    const deductions = body.deductions || [];

    // 破月計算：日薪 = 足月應領總額 / 30
    const baseSalary = parseInt(body.baseSalary) || 0;
    const payDays = parseInt(body.payDays) || 0;
    const year = parseInt(body.year) || 0;
    const month = parseInt(body.month) || 0;
    const monthLastDay = year > 0 && month > 0 ? new Date(year + 1911, month, 0).getDate() : 30;
    const isFullMonth = payDays >= monthLastDay;

    const bonusTotal = bonuses.reduce((s: number, b: { amount: string }) => s + (parseInt(b.amount) || 0), 0);
    const fullMonthEarnings = baseSalary
      - (parseInt(body.leaveDeduction) || 0)
      + (parseInt(body.overtimePay) || 0)
      + (parseInt(body.fullAttendanceBonus) || 0)
      + (parseInt(body.supervisorAllowance) || 0)
      + bonusTotal;

    const dailyWage = fullMonthEarnings > 0 ? Math.round(fullMonthEarnings / 30) : 0;
    const totalEarnings = isFullMonth ? fullMonthEarnings : dailyWage * payDays;

    const deductionTotal = deductions.reduce((s: number, d: { amount: string }) => s + (parseInt(d.amount) || 0), 0);
    const totalDeductions = (parseInt(body.laborInsurance) || 0)
      + (parseInt(body.healthInsurance) || 0)
      + (parseInt(body.otherDeduction) || 0)
      + deductionTotal;

    const netPay = totalEarnings - totalDeductions;

    const [record] = await db.insert(salaryRecords).values({
      employeeId: body.employeeId,
      year: body.year,
      month: body.month,
      workPeriodStart: body.workPeriodStart || null,
      workPeriodEnd: body.workPeriodEnd || null,
      payDays: body.payDays || null,
      baseSalary: body.baseSalary || "0",
      leaveDays: body.leaveDays || null,
      leaveDeduction: body.leaveDeduction || "0",
      overtimePay: body.overtimePay || "0",
      fullAttendanceBonus: body.fullAttendanceBonus || "0",
      supervisorAllowance: body.supervisorAllowance || "0",
      laborInsurance: body.laborInsurance || "0",
      healthInsurance: body.healthInsurance || "0",
      otherDeduction: body.otherDeduction || "0",
      otherDeductionNote: body.otherDeductionNote || null,
      totalEarnings: totalEarnings.toString(),
      totalDeductions: totalDeductions.toString(),
      netPay: netPay.toString(),
      note: body.note || null,
      internalNote: body.internalNote || null,
    }).returning();

    // Insert bonuses
    if (bonuses.length > 0) {
      await db.insert(salaryBonuses).values(
        bonuses.map((b: { name: string; amount: string }) => ({
          salaryRecordId: record.id,
          name: b.name,
          amount: b.amount || "0",
        }))
      );
    }

    // Insert deductions
    if (deductions.length > 0) {
      await db.insert(salaryDeductions).values(
        deductions.map((d: { name: string; amount: string }) => ({
          salaryRecordId: record.id,
          name: d.name,
          amount: d.amount || "0",
        }))
      );
    }

    return NextResponse.json(record, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Create salary error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
