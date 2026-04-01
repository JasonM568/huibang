import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { salaryRecords, employees } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const employeeId = searchParams.get("employeeId");

    // 年度統計（按月）
    if (year && !employeeId) {
      const data = await db
        .select({
          month: salaryRecords.month,
          totalNetPay: sql<string>`sum(${salaryRecords.netPay})`,
          totalEarnings: sql<string>`sum(${salaryRecords.totalEarnings})`,
          totalDeductions: sql<string>`sum(${salaryRecords.totalDeductions})`,
          headcount: sql<number>`count(*)`,
        })
        .from(salaryRecords)
        .where(eq(salaryRecords.year, parseInt(year)))
        .groupBy(salaryRecords.month)
        .orderBy(salaryRecords.month);

      // 年度總計
      const [yearTotal] = await db
        .select({
          totalNetPay: sql<string>`sum(${salaryRecords.netPay})`,
          totalEarnings: sql<string>`sum(${salaryRecords.totalEarnings})`,
          totalDeductions: sql<string>`sum(${salaryRecords.totalDeductions})`,
        })
        .from(salaryRecords)
        .where(eq(salaryRecords.year, parseInt(year)));

      return NextResponse.json({ monthly: data, yearTotal });
    }

    // 個人年度統計
    if (year && employeeId) {
      const data = await db
        .select({
          month: salaryRecords.month,
          baseSalary: salaryRecords.baseSalary,
          totalEarnings: salaryRecords.totalEarnings,
          totalDeductions: salaryRecords.totalDeductions,
          netPay: salaryRecords.netPay,
        })
        .from(salaryRecords)
        .where(and(
          eq(salaryRecords.year, parseInt(year)),
          eq(salaryRecords.employeeId, employeeId)
        ))
        .orderBy(salaryRecords.month);

      const [emp] = await db.select().from(employees).where(eq(employees.id, employeeId));

      return NextResponse.json({ employee: emp, monthly: data });
    }

    // 可用年份列表
    const years = await db
      .selectDistinct({ year: salaryRecords.year })
      .from(salaryRecords)
      .orderBy(salaryRecords.year);

    return NextResponse.json({ years: years.map(y => y.year) });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Salary stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
