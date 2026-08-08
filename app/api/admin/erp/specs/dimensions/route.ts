import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { erpSpecDimensions, erpSpecOptions } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

// 回傳全部維度 + 各維度選項（巢狀），供設定頁與商品表單共用
export async function GET() {
  try {
    await requireAuth();
    const dimensions = await db
      .select()
      .from(erpSpecDimensions)
      .orderBy(asc(erpSpecDimensions.sortOrder), asc(erpSpecDimensions.createdAt));
    const options = await db
      .select()
      .from(erpSpecOptions)
      .orderBy(asc(erpSpecOptions.sortOrder), asc(erpSpecOptions.createdAt));

    const data = dimensions.map((d) => ({
      ...d,
      options: options.filter((o) => o.dimensionId === d.id),
    }));
    return NextResponse.json({ data });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ERP spec dimensions list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: "名稱必填" }, { status: 400 });
    }
    const [dimension] = await db
      .insert(erpSpecDimensions)
      .values({ name: body.name, sortOrder: body.sortOrder ?? 0 })
      .returning();
    return NextResponse.json(dimension, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "維度名稱已存在" }, { status: 400 });
    }
    console.error("ERP spec dimension create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
