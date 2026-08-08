import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { erpCategories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    const body = await request.json();
    const [category] = await db
      .update(erpCategories)
      .set({
        ...(body.name !== undefined && { name: body.name }),
        ...(body.parentId !== undefined && { parentId: body.parentId || null }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      })
      .where(eq(erpCategories.id, params.id))
      .returning();
    if (!category) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(category);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ERP category update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    await db.delete(erpCategories).where(eq(erpCategories.id, params.id));
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // FK violation：分類仍被商品/子分類引用
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "23503") {
      return NextResponse.json({ error: "此分類仍被商品或子分類使用，無法刪除" }, { status: 400 });
    }
    console.error("ERP category delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
