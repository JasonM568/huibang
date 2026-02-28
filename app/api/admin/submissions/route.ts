import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { desc, eq, like, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const industry = searchParams.get("industry");
    const search = searchParams.get("search");
    const offset = (page - 1) * limit;

    let query = db.select().from(submissions);

    // Build conditions
    const conditions = [];
    if (status) conditions.push(eq(submissions.status, status));
    if (industry) conditions.push(eq(submissions.industry, industry));
    if (search) conditions.push(like(submissions.brandName, `%${search}%`));

    // Apply conditions
    if (conditions.length > 0) {
      for (const cond of conditions) {
        query = query.where(cond) as typeof query;
      }
    }

    const data = await query
      .orderBy(desc(submissions.createdAt))
      .limit(limit)
      .offset(offset);

    // Count total
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(submissions);

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
    console.error("Admin submissions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
