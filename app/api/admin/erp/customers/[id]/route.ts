import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { erpCustomers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    const [customer] = await db.select().from(erpCustomers).where(eq(erpCustomers.id, params.id));
    if (!customer) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(customer);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ERP customer get error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    const body = await request.json();

    const [customer] = await db
      .update(erpCustomers)
      .set({
        ...(body.code !== undefined && { code: body.code?.trim() || null }),
        ...(body.companyName !== undefined && { companyName: body.companyName.trim() }),
        ...(body.taxId !== undefined && { taxId: body.taxId?.trim() || null }),
        ...(body.customerType !== undefined &&
          ["wholesale", "dealer", "retail"].includes(body.customerType) && {
            customerType: body.customerType,
          }),
        ...(body.contactName !== undefined && { contactName: body.contactName?.trim() || null }),
        ...(body.phone !== undefined && { phone: body.phone?.trim() || null }),
        ...(body.email !== undefined && { email: body.email?.trim() || null }),
        ...(body.address !== undefined && { address: body.address?.trim() || null }),
        ...(body.paymentTerms !== undefined && { paymentTerms: body.paymentTerms?.trim() || null }),
        ...(body.note !== undefined && { note: body.note?.trim() || null }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        updatedAt: new Date(),
      })
      .where(eq(erpCustomers.id, params.id))
      .returning();
    if (!customer) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(customer);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "客戶代號已存在" }, { status: 400 });
    }
    console.error("ERP customer update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    await db.delete(erpCustomers).where(eq(erpCustomers.id, params.id));
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // 已被銷售訂單引用時擋刪除，改停用
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "23503") {
      return NextResponse.json({ error: "此客戶已有訂單紀錄，無法刪除，請改為停用" }, { status: 400 });
    }
    console.error("ERP customer delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
