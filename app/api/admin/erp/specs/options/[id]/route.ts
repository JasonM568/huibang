import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { erpSpecOptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    const body = await request.json();
    const [option] = await db
      .update(erpSpecOptions)
      .set({
        ...(body.value !== undefined && { value: body.value }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      })
      .where(eq(erpSpecOptions.id, params.id))
      .returning();
    if (!option) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(option);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "此維度已有相同選項值" }, { status: 400 });
    }
    console.error("ERP spec option update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    await db.delete(erpSpecOptions).where(eq(erpSpecOptions.id, params.id));
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ERP spec option delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
