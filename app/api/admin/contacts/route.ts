import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactSubmissions } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const offset = (page - 1) * limit;

    let query = db.select().from(contactSubmissions);

    if (status) {
      query = query.where(eq(contactSubmissions.status, status)) as typeof query;
    }

    const data = await query
      .orderBy(desc(contactSubmissions.createdAt))
      .limit(limit)
      .offset(offset);

    const conditions = status
      ? [eq(contactSubmissions.status, status)]
      : [];

    let countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(contactSubmissions);

    if (status) {
      countQuery = countQuery.where(eq(contactSubmissions.status, status)) as typeof countQuery;
    }

    const [{ count }] = await countQuery;

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Contacts list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireAuth();
    if (session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id));

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Delete contact error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    const { id, status, internalNote } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (status) updates.status = status;
    if (internalNote !== undefined) updates.internalNote = internalNote;

    const [updated] = await db
      .update(contactSubmissions)
      .set(updates)
      .where(eq(contactSubmissions.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Contact update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
