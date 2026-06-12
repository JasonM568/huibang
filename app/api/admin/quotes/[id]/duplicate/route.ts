import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quotes, quoteItems, customers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireRestrictedAccess } from "@/lib/auth";

function generateQuoteNumber(customerName: string) {
  const now = new Date();
  const y = now.getFullYear();
  const m = (now.getMonth() + 1).toString().padStart(2, "0");
  const d = now.getDate().toString().padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `Q-${customerName}-${y}${m}${d}-${rand}`;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRestrictedAccess();
    const { id } = await params;

    const [source] = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, id));

    if (!source) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [customer] = await db
      .select({ companyName: customers.companyName })
      .from(customers)
      .where(eq(customers.id, source.customerId));

    if (!customer) {
      return NextResponse.json(
        { error: "客戶不存在，無法複製" },
        { status: 400 }
      );
    }

    // 計算新的 validUntil：今天 + 原本有效天數，否則預設 +30 天
    const now = new Date();
    const sourceCreated = new Date(source.createdAt).getTime();
    const sourceValidUntil = new Date(source.validUntil).getTime();
    const durationMs = sourceValidUntil - sourceCreated;
    const oneDayMs = 24 * 60 * 60 * 1000;
    const validDays =
      durationMs > 0 ? Math.round(durationMs / oneDayMs) : 30;
    const newValidUntil = new Date(now.getTime() + validDays * oneDayMs);

    const [newQuote] = await db
      .insert(quotes)
      .values({
        quoteNumber: generateQuoteNumber(customer.companyName),
        customerId: source.customerId,
        userId: session.userId,
        discount: source.discount,
        taxRate: source.taxRate,
        taxType: source.taxType,
        validUntil: newValidUntil,
        status: "draft",
        notes: source.notes,
        subtotal: source.subtotal,
        taxAmount: source.taxAmount,
        totalAmount: source.totalAmount,
      })
      .returning();

    const sourceItems = await db
      .select()
      .from(quoteItems)
      .where(eq(quoteItems.quoteId, id));

    if (sourceItems.length > 0) {
      await db.insert(quoteItems).values(
        sourceItems.map((item) => ({
          quoteId: newQuote.id,
          serviceId: item.serviceId,
          name: item.name,
          specification: item.specification,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          amount: item.amount,
        }))
      );
    }

    return NextResponse.json(
      { id: newQuote.id, quoteNumber: newQuote.quoteNumber },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Duplicate quote error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
