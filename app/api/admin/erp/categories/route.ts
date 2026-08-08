import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { erpCategories } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth();
    const data = await db
      .select()
      .from(erpCategories)
      .orderBy(asc(erpCategories.sortOrder), asc(erpCategories.createdAt));
    return NextResponse.json({ data });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ERP categories list error:", error);
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
    const [category] = await db
      .insert(erpCategories)
      .values({
        name: body.name,
        parentId: body.parentId || null,
        sortOrder: body.sortOrder ?? 0,
      })
      .returning();
    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ERP category create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
