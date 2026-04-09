import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { desc, sql, ilike } from "drizzle-orm";
import { requireRestrictedAccess } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await requireRestrictedAccess();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search");
    const all = searchParams.get("all"); // for dropdown lists
    const offset = (page - 1) * limit;

    let query = db.select().from(services);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(services);

    if (search) {
      const condition = ilike(services.name, `%${search}%`);
      query = query.where(condition) as typeof query;
      countQuery = countQuery.where(condition) as typeof countQuery;
    }

    if (all) {
      const data = await query.orderBy(desc(services.createdAt));
      return NextResponse.json({ data });
    }

    const data = await query
      .orderBy(desc(services.createdAt))
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
    console.error("Services list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireRestrictedAccess();
    const body = await request.json();

    const [service] = await db
      .insert(services)
      .values({
        name: body.name,
        specification: body.specification || null,
        unitPrice: body.unitPrice,
        description: body.description || null,
      })
      .returning();

    return NextResponse.json(service, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create service error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
