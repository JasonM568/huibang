import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { employees, employeeAllowances } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireRestrictedAccess } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRestrictedAccess();
    const { id } = await params;

    const [employee] = await db.select().from(employees).where(eq(employees.id, id)).limit(1);
    if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const allowances = await db.select().from(employeeAllowances).where(eq(employeeAllowances.employeeId, id));

    return NextResponse.json({ ...employee, allowances });
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
    await requireRestrictedAccess();
    const { id } = await params;
    const body = await request.json();

    // 更新員工基本資料
    const { allowances, ...employeeData } = body;
    const [updated] = await db.update(employees).set({ ...employeeData, updatedAt: new Date() }).where(eq(employees.id, id)).returning();

    // 如果有傳入 allowances，整批更新
    if (allowances !== undefined) {
      await db.delete(employeeAllowances).where(eq(employeeAllowances.employeeId, id));
      if (allowances.length > 0) {
        await db.insert(employeeAllowances).values(
          allowances.map((a: { name: string; amount: string }) => ({
            employeeId: id,
            name: a.name,
            amount: a.amount || "0",
          }))
        );
      }
    }

    // 回傳更新後的完整資料
    const updatedAllowances = await db.select().from(employeeAllowances).where(eq(employeeAllowances.employeeId, id));

    return NextResponse.json({ ...updated, allowances: updatedAllowances });
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
    const session = await requireRestrictedAccess();
    if (session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await params;
    await db.delete(employees).where(eq(employees.id, id));
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
