import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { erpSpecDimensions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    const body = await request.json();
    const [dimension] = await db
      .update(erpSpecDimensions)
      .set({
        ...(body.name !== undefined && { name: body.name }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      })
      .where(eq(erpSpecDimensions.id, params.id))
      .returning();
    if (!dimension) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(dimension);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "維度名稱已存在" }, { status: 400 });
    }
    console.error("ERP spec dimension update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    // options 與 product_specs 皆 ON DELETE CASCADE
    await db.delete(erpSpecDimensions).where(eq(erpSpecDimensions.id, params.id));
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ERP spec dimension delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
