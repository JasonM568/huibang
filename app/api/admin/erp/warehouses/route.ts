import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { erpWarehouses } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth();
    const data = await db
      .select()
      .from(erpWarehouses)
      .orderBy(asc(erpWarehouses.createdAt));
    return NextResponse.json({ data });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ERP warehouses list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    if (!body.code || !body.name) {
      return NextResponse.json({ error: "代號與名稱必填" }, { status: 400 });
    }
    if (body.warehouseType === "sub" && !body.parentId) {
      return NextResponse.json({ error: "子倉必須指定所屬主倉" }, { status: 400 });
    }
    const [warehouse] = await db
      .insert(erpWarehouses)
      .values({
        code: body.code,
        name: body.name,
        warehouseType: body.warehouseType === "sub" ? "sub" : "main",
        parentId: body.warehouseType === "sub" ? body.parentId : null,
        address: body.address || null,
      })
      .returning();
    return NextResponse.json(warehouse, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "倉庫代號已存在" }, { status: 400 });
    }
    console.error("ERP warehouse create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
