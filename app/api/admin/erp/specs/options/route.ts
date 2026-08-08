import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { erpSpecOptions } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    if (!body.dimensionId || !body.value) {
      return NextResponse.json({ error: "維度與選項值必填" }, { status: 400 });
    }
    const [option] = await db
      .insert(erpSpecOptions)
      .values({
        dimensionId: body.dimensionId,
        value: body.value,
        sortOrder: body.sortOrder ?? 0,
      })
      .returning();
    return NextResponse.json(option, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "此維度已有相同選項值" }, { status: 400 });
    }
    console.error("ERP spec option create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
