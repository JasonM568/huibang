import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { employees, employeeAllowances } from "@/lib/db/schema";
import { desc, sql, ilike, eq } from "drizzle-orm";
import { requireRestrictedAccess } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await requireRestrictedAccess();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all");
    const search = searchParams.get("search");
    const activeOnly = searchParams.get("active");

    let query = db.select().from(employees);

    if (search) {
      query = query.where(ilike(employees.name, `%${search}%`)) as typeof query;
    }
    if (activeOnly) {
      query = query.where(eq(employees.isActive, true)) as typeof query;
    }

    if (all) {
      const data = await query.orderBy(employees.name);
      return NextResponse.json({ data });
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    const data = await query.orderBy(desc(employees.createdAt)).limit(limit).offset(offset);

    let countQuery = db.select({ count: sql<number>`count(*)` }).from(employees);
    if (search) countQuery = countQuery.where(ilike(employees.name, `%${search}%`)) as typeof countQuery;
    const [{ count }] = await countQuery;

    return NextResponse.json({ data, pagination: { page, limit, total: Number(count), totalPages: Math.ceil(Number(count) / limit) } });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Employees list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireRestrictedAccess();
    const body = await request.json();
    const [emp] = await db.insert(employees).values({
      name: body.name,
      department: body.department || null,
      jobTitle: body.jobTitle || null,
      jobGrade: body.jobGrade || null,
      baseSalary: body.baseSalary || "0",
      startDate: body.startDate ? new Date(body.startDate) : null,
      note: body.note || null,
    }).returning();
    return NextResponse.json(emp, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Create employee error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
