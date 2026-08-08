import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { erpWarehouses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    const body = await request.json();
    if (body.warehouseType === "sub" && body.parentId === params.id) {
      return NextResponse.json({ error: "子倉的所屬主倉不能是自己" }, { status: 400 });
    }
    const [warehouse] = await db
      .update(erpWarehouses)
      .set({
        ...(body.code !== undefined && { code: body.code }),
        ...(body.name !== undefined && { name: body.name }),
        ...(body.warehouseType !== undefined && {
          warehouseType: body.warehouseType === "sub" ? "sub" : "main",
          parentId: body.warehouseType === "sub" ? body.parentId || null : null,
        }),
        ...(body.address !== undefined && { address: body.address || null }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        updatedAt: new Date(),
      })
      .where(eq(erpWarehouses.id, params.id))
      .returning();
    if (!warehouse) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(warehouse);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "倉庫代號已存在" }, { status: 400 });
    }
    console.error("ERP warehouse update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    await db.delete(erpWarehouses).where(eq(erpWarehouses.id, params.id));
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "23503") {
      return NextResponse.json({ error: "此倉庫仍有庫存或單據引用，無法刪除" }, { status: 400 });
    }
    console.error("ERP warehouse delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
