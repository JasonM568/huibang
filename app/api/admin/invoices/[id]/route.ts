import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invoices, quotes, quoteItems, customers, adminUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const [invoice] = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        quoteId: invoices.quoteId,
        quoteNumber: quotes.quoteNumber,
        customerId: invoices.customerId,
        customerName: customers.companyName,
        customerTaxId: customers.taxId,
        customerAddress: customers.address,
        customerContact: customers.contactPerson,
        customerEmail: customers.email,
        customerPhone: customers.phone,
        userName: adminUsers.name,
        subtotal: invoices.subtotal,
        taxAmount: invoices.taxAmount,
        totalAmount: invoices.totalAmount,
        invoiceStatus: invoices.invoiceStatus,
        issuedDate: invoices.issuedDate,
        sentDate: invoices.sentDate,
        paymentStatus: invoices.paymentStatus,
        paidDate: invoices.paidDate,
        notes: invoices.notes,
        createdAt: invoices.createdAt,
      })
      .from(invoices)
      .leftJoin(quotes, eq(invoices.quoteId, quotes.id))
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .leftJoin(adminUsers, eq(invoices.userId, adminUsers.id))
      .where(eq(invoices.id, id));

    if (!invoice) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // 取得報價單項目（請款單沿用報價單品項）
    const items = await db
      .select()
      .from(quoteItems)
      .where(eq(quoteItems.quoteId, invoice.quoteId));

    return NextResponse.json({ ...invoice, items });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();

    const updates: Record<string, any> = { updatedAt: new Date() };

    if (body.invoiceStatus !== undefined) updates.invoiceStatus = body.invoiceStatus;
    if (body.issuedDate !== undefined) updates.issuedDate = body.issuedDate ? new Date(body.issuedDate) : null;
    if (body.sentDate !== undefined) updates.sentDate = body.sentDate ? new Date(body.sentDate) : null;
    if (body.paymentStatus !== undefined) updates.paymentStatus = body.paymentStatus;
    if (body.paidDate !== undefined) updates.paidDate = body.paidDate ? new Date(body.paidDate) : null;
    if (body.notes !== undefined) updates.notes = body.notes;

    const [updated] = await db
      .update(invoices)
      .set(updates)
      .where(eq(invoices.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;

    await db.delete(invoices).where(eq(invoices.id, id));
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
