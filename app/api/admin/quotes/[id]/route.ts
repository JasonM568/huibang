import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quotes, quoteItems, customers, adminUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireRestrictedAccess } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRestrictedAccess();
    const { id } = await params;

    const [quote] = await db
      .select({
        id: quotes.id,
        quoteNumber: quotes.quoteNumber,
        customerId: quotes.customerId,
        customerName: customers.companyName,
        customerTaxId: customers.taxId,
        customerAddress: customers.address,
        customerContact: customers.contactPerson,
        customerEmail: customers.email,
        customerPhone: customers.phone,
        userId: quotes.userId,
        userName: adminUsers.name,
        discount: quotes.discount,
        taxRate: quotes.taxRate,
        taxType: quotes.taxType,
        validUntil: quotes.validUntil,
        status: quotes.status,
        notes: quotes.notes,
        subtotal: quotes.subtotal,
        taxAmount: quotes.taxAmount,
        totalAmount: quotes.totalAmount,
        createdAt: quotes.createdAt,
      })
      .from(quotes)
      .leftJoin(customers, eq(quotes.customerId, customers.id))
      .leftJoin(adminUsers, eq(quotes.userId, adminUsers.id))
      .where(eq(quotes.id, id));

    if (!quote) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const items = await db
      .select()
      .from(quoteItems)
      .where(eq(quoteItems.quoteId, id));

    return NextResponse.json({ ...quote, items });
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
    await requireRestrictedAccess();
    const { id } = await params;
    const body = await request.json();

    // If updating items, recalculate totals
    if (body.items) {
      const items = body.items;
      // 每個項次各自折扣，amount 為折後金額；afterDiscount = 各項次折後金額之和
      const afterDiscount = items.reduce(
        (sum: number, item: { unitPrice: string; quantity: string; discount?: string }) =>
          sum + Math.round(
            (parseFloat(item.unitPrice) || 0) *
              (parseFloat(item.quantity) || 0) *
              (1 - (parseFloat(item.discount || "0") || 0) / 100)
          ),
        0
      );
      const taxRate = parseFloat(body.taxRate || "5");
      const taxType = body.taxType === "inclusive" ? "inclusive" : "exclusive";
      // inclusive（含稅）：輸入金額已含稅，總計 = 折後小計，稅額為內含反推
      const taxAmount = taxType === "inclusive"
        ? Math.round(afterDiscount - afterDiscount / (1 + taxRate / 100))
        : Math.round(afterDiscount * (taxRate / 100));
      const totalAmount = taxType === "inclusive" ? afterDiscount : afterDiscount + taxAmount;

      // Update quote
      const [updated] = await db
        .update(quotes)
        .set({
          customerId: body.customerId,
          discount: "0", // 折扣已下放至各項次，整單折扣欄位停用
          taxRate: body.taxRate,
          taxType,
          validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
          notes: body.notes,
          subtotal: afterDiscount.toFixed(2), // 折後小計（未稅）
          taxAmount: taxAmount.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(quotes.id, id))
        .returning();

      // Replace items — amount 為該項次折後金額
      await db.delete(quoteItems).where(eq(quoteItems.quoteId, id));
      if (items.length > 0) {
        await db.insert(quoteItems).values(
          items.map((item: { serviceId?: string; name: string; specification?: string; unitPrice: string; quantity: string; discount?: string }) => ({
            quoteId: id,
            serviceId: item.serviceId || null,
            name: item.name,
            specification: item.specification || null,
            unitPrice: item.unitPrice || "0",
            quantity: parseInt(item.quantity) || 1,
            discount: item.discount || "0",
            amount: Math.round(
              (parseFloat(item.unitPrice) || 0) *
                (parseFloat(item.quantity) || 0) *
                (1 - (parseFloat(item.discount || "0") || 0) / 100)
            ).toString(),
          }))
        );
      }

      return NextResponse.json(updated);
    }

    // Simple status update
    const [updated] = await db
      .update(quotes)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(quotes.id, id))
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
    const session = await requireRestrictedAccess();
    if (session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;

    await db.delete(quotes).where(eq(quotes.id, id));
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
