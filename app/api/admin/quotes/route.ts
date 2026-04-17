import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quotes, quoteItems, customers, adminUsers } from "@/lib/db/schema";
import { desc, eq, sql, ilike } from "drizzle-orm";
import { requireRestrictedAccess } from "@/lib/auth";

function generateQuoteNumber(customerName: string) {
  const now = new Date();
  const y = now.getFullYear();
  const m = (now.getMonth() + 1).toString().padStart(2, "0");
  const d = now.getDate().toString().padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `Q-${customerName}-${y}${m}${d}-${rand}`;
}

export async function GET(request: Request) {
  try {
    await requireRestrictedAccess();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const offset = (page - 1) * limit;

    const conditions = [];
    if (status) conditions.push(eq(quotes.status, status));
    if (search) conditions.push(ilike(customers.companyName, `%${search}%`));

    const where = conditions.length > 0
      ? sql`${sql.join(conditions, sql` AND `)}`
      : undefined;

    const data = await db
      .select({
        id: quotes.id,
        quoteNumber: quotes.quoteNumber,
        customerName: customers.companyName,
        customerId: quotes.customerId,
        userName: adminUsers.name,
        status: quotes.status,
        totalAmount: quotes.totalAmount,
        validUntil: quotes.validUntil,
        createdAt: quotes.createdAt,
      })
      .from(quotes)
      .leftJoin(customers, eq(quotes.customerId, customers.id))
      .leftJoin(adminUsers, eq(quotes.userId, adminUsers.id))
      .where(where)
      .orderBy(desc(quotes.createdAt))
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(quotes)
      .leftJoin(customers, eq(quotes.customerId, customers.id))
      .where(where);

    const count = countResult[0].count;

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
    console.error("Quotes list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRestrictedAccess();
    const body = await request.json();

    const items = body.items || [];

    // Fetch customer name for quote number
    const [customer] = await db
      .select({ companyName: customers.companyName })
      .from(customers)
      .where(eq(customers.id, body.customerId));
    const customerName = customer?.companyName || "未知客戶";

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: { unitPrice: string; quantity: string }) =>
        sum + (parseFloat(item.unitPrice) || 0) * (parseFloat(item.quantity) || 0),
      0
    );
    const discountAmount = subtotal * (parseFloat(body.discount || "0") / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (parseFloat(body.taxRate || "5") / 100);
    const totalAmount = afterDiscount + taxAmount;

    const [quote] = await db
      .insert(quotes)
      .values({
        quoteNumber: generateQuoteNumber(customerName),
        customerId: body.customerId,
        userId: session.userId,
        discount: body.discount || "0",
        taxRate: body.taxRate || "5",
        validUntil: new Date(body.validUntil),
        notes: body.notes || null,
        subtotal: subtotal.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
      })
      .returning();

    // Insert items
    if (items.length > 0) {
      await db.insert(quoteItems).values(
        items.map((item: { serviceId?: string; name: string; specification?: string; unitPrice: string; quantity: string }) => ({
          quoteId: quote.id,
          serviceId: item.serviceId || null,
          name: item.name,
          specification: item.specification || null,
          unitPrice: item.unitPrice || "0",
          quantity: parseInt(item.quantity) || 1,
          amount: ((parseFloat(item.unitPrice) || 0) * (parseFloat(item.quantity) || 0)).toString(),
        }))
      );
    }

    return NextResponse.json(quote, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create quote error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
