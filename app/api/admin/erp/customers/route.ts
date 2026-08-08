import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { erpCustomers } from "@/lib/db/schema";
import { desc, eq, ilike, or, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const customerType = searchParams.get("customerType");

    const conditions = [];
    if (search) {
      conditions.push(
        or(
          ilike(erpCustomers.companyName, `%${search}%`),
          ilike(erpCustomers.contactName, `%${search}%`),
          ilike(erpCustomers.phone, `%${search}%`),
          ilike(erpCustomers.code, `%${search}%`)
        )
      );
    }
    if (customerType) {
      conditions.push(eq(erpCustomers.customerType, customerType));
    }

    const data = await db
      .select()
      .from(erpCustomers)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(erpCustomers.createdAt));

    return NextResponse.json({ data });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ERP customers list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    if (!body.companyName?.trim()) {
      return NextResponse.json({ error: "客戶名稱必填" }, { status: 400 });
    }
    const customerType = ["wholesale", "dealer", "retail"].includes(body.customerType)
      ? body.customerType
      : "retail";

    const [customer] = await db
      .insert(erpCustomers)
      .values({
        code: body.code?.trim() || null,
        companyName: body.companyName.trim(),
        taxId: body.taxId?.trim() || null,
        customerType,
        contactName: body.contactName?.trim() || null,
        phone: body.phone?.trim() || null,
        email: body.email?.trim() || null,
        address: body.address?.trim() || null,
        paymentTerms: body.paymentTerms?.trim() || null,
        note: body.note?.trim() || null,
      })
      .returning();

    return NextResponse.json(customer, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "客戶代號已存在" }, { status: 400 });
    }
    console.error("ERP customer create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
