import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ledgerEntries } from "@/lib/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // payable / receivable
    const status = searchParams.get("status");

    const conditions = [];
    if (type) conditions.push(eq(ledgerEntries.type, type));
    if (status) conditions.push(eq(ledgerEntries.paymentStatus, status));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(ledgerEntries)
      .where(where)
      .orderBy(desc(ledgerEntries.createdAt));

    return NextResponse.json({ data });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Ledger list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();

    if (!body.type || !body.description || !body.amount) {
      return NextResponse.json({ error: "類型、說明、金額為必填" }, { status: 400 });
    }

    const [entry] = await db
      .insert(ledgerEntries)
      .values({
        type: body.type,
        description: body.description,
        amount: body.amount,
        counterparty: body.counterparty || null,
        invoiceNo: body.invoiceNo || null,
        invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : null,
        paymentStatus: body.paymentStatus || "pending",
        expectedPayDate: body.expectedPayDate ? new Date(body.expectedPayDate) : null,
        transactionDate: body.transactionDate ? new Date(body.transactionDate) : null,
        note: body.note || null,
      })
      .returning();

    return NextResponse.json(entry, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Create ledger error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
