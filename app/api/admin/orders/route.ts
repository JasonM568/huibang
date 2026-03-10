import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { desc, eq, sql, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const paymentStatus = searchParams.get("paymentStatus");
    const invoiceStatus = searchParams.get("invoiceStatus");
    const productType = searchParams.get("productType");
    const search = searchParams.get("search");
    const offset = (page - 1) * limit;

    const conditions = [];
    if (paymentStatus) conditions.push(eq(orders.paymentStatus, paymentStatus));
    if (invoiceStatus) conditions.push(eq(orders.invoiceStatus, invoiceStatus));
    if (productType) conditions.push(eq(orders.productType, productType));
    if (search) {
      conditions.push(
        sql`(${orders.orderNo} ILIKE ${`%${search}%`} OR ${orders.customerEmail} ILIKE ${`%${search}%`} OR ${orders.customerName} ILIKE ${`%${search}%`})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(orders)
      .where(whereClause)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    // Count with same filters
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(orders);
    if (whereClause) {
      countQuery = countQuery.where(whereClause) as typeof countQuery;
    }
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
    console.error("Admin orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
