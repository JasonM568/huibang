import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { desc, sql, ilike } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");
    const offset = (page - 1) * limit;

    let query = db.select().from(customers);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(customers);

    if (search) {
      const condition = ilike(customers.companyName, `%${search}%`);
      query = query.where(condition) as typeof query;
      countQuery = countQuery.where(condition) as typeof countQuery;
    }

    const data = await query
      .orderBy(desc(customers.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await countQuery;

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Customers list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();

    const [customer] = await db
      .insert(customers)
      .values({
        companyName: body.companyName,
        taxId: body.taxId || null,
        contactPerson: body.contactPerson,
        address: body.address || null,
        email: body.email,
        phone: body.phone || null,
      })
      .returning();

    return NextResponse.json(customer, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create customer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
