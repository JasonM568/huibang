import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { frequentCounterparties } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth();
    const data = await db.select().from(frequentCounterparties).orderBy(asc(frequentCounterparties.name));
    return NextResponse.json(data);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const { name } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: "名稱為必填" }, { status: 400 });

    const [entry] = await db
      .insert(frequentCounterparties)
      .values({ name: name.trim() })
      .onConflictDoNothing()
      .returning();

    return NextResponse.json(entry || { name: name.trim() }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await db.delete(frequentCounterparties).where(eq(frequentCounterparties.id, id));
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
