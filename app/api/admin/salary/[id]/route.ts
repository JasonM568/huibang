import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { salaryRecords, salaryBonuses, employees } from "@/lib/db/schema";
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
        employmentInsurance: salaryRecords.employmentInsurance,
        annualDues: salaryRecords.annualDues,
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

    return NextResponse.json({ ...record, bonuses });
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

    if (bonuses !== undefined) {
      const bonusTotal = bonuses.reduce((s: number, b: { amount: string }) => s + (parseInt(b.amount) || 0), 0);
      const totalEarnings = (parseInt(body.baseSalary) || 0)
        - (parseInt(body.leaveDeduction) || 0)
        + (parseInt(body.overtimePay) || 0)
        + (parseInt(body.fullAttendanceBonus) || 0)
        + (parseInt(body.supervisorAllowance) || 0)
        + bonusTotal;
      const totalDeductions = (parseInt(body.laborInsurance) || 0)
        + (parseInt(body.healthInsurance) || 0)
        + (parseInt(body.employmentInsurance) || 0)
        + (parseInt(body.annualDues) || 0)
        + (parseInt(body.otherDeduction) || 0);
      const netPay = totalEarnings - totalDeductions;

      await db.update(salaryRecords).set({
        ...body,
        bonuses: undefined,
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
