import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invoices, quotes, customers, adminUsers } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

function generateInvoiceNumber() {
  const now = new Date();
  const y = now.getFullYear().toString().slice(2);
  const m = (now.getMonth() + 1).toString().padStart(2, "0");
  const d = now.getDate().toString().padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV${y}${m}${d}-${rand}`;
}

export async function GET(request: Request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const invoiceStatus = searchParams.get("invoiceStatus");
    const paymentStatus = searchParams.get("paymentStatus");
    const offset = (page - 1) * limit;

    const conditions = [];
    if (invoiceStatus) conditions.push(eq(invoices.invoiceStatus, invoiceStatus));
    if (paymentStatus) conditions.push(eq(invoices.paymentStatus, paymentStatus));

    const where = conditions.length > 0
      ? sql`${sql.join(conditions, sql` AND `)}`
      : undefined;

    const data = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        quoteNumber: quotes.quoteNumber,
        customerName: customers.companyName,
        totalAmount: invoices.totalAmount,
        invoiceStatus: invoices.invoiceStatus,
        issuedDate: invoices.issuedDate,
        sentDate: invoices.sentDate,
        paymentStatus: invoices.paymentStatus,
        paidDate: invoices.paidDate,
        createdAt: invoices.createdAt,
      })
      .from(invoices)
      .leftJoin(quotes, eq(invoices.quoteId, quotes.id))
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(where)
      .orderBy(desc(invoices.createdAt))
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
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
    console.error("Invoices list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: 從報價單建立請款單
export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { quoteId } = body;

    if (!quoteId) {
      return NextResponse.json({ error: "Missing quoteId" }, { status: 400 });
    }

    // 取得報價單資料
    const [quote] = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, quoteId));

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const [invoice] = await db
      .insert(invoices)
      .values({
        invoiceNumber: generateInvoiceNumber(),
        quoteId: quote.id,
        customerId: quote.customerId,
        userId: session.userId,
        subtotal: quote.subtotal,
        taxAmount: quote.taxAmount,
        totalAmount: quote.totalAmount,
        notes: body.notes || null,
      })
      .returning();

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create invoice error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
