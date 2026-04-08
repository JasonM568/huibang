import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ledgerEntries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    const fields = ["type", "description", "amount", "counterparty", "invoiceNo", "paymentStatus", "note"];
    for (const f of fields) {
      if (body[f] !== undefined) updates[f] = body[f];
    }
    if (body.invoiceDate !== undefined) updates.invoiceDate = body.invoiceDate ? new Date(body.invoiceDate) : null;
    if (body.transactionDate !== undefined) updates.transactionDate = body.transactionDate ? new Date(body.transactionDate) : null;

    const [updated] = await db
      .update(ledgerEntries)
      .set(updates)
      .where(eq(ledgerEntries.id, id))
      .returning();

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Update ledger error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    await db.delete(ledgerEntries).where(eq(ledgerEntries.id, id));
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Delete ledger error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
