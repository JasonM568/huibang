import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { desc, eq, like, sql, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

async function generateClientNumber() {
  const now = new Date();
  const mm = (now.getMonth() + 1).toString().padStart(2, "0");
  const dd = now.getDate().toString().padStart(2, "0");
  const yy = now.getFullYear().toString().slice(-2);
  const dateStr = `${mm}${dd}${yy}`;
  const prefix = `C-${dateStr}-`;

  // 查詢當天已有幾筆客戶
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(clients)
    .where(like(clients.clientNumber, `${prefix}%`));

  const seq = Number(result?.count || 0) + 1;
  return `${prefix}${seq}`;
}

export async function GET(request: Request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const offset = (page - 1) * limit;

    const conditions = [];
    if (status) conditions.push(eq(clients.status, status));
    if (search) conditions.push(like(clients.brandName, `%${search}%`));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(clients)
      .where(whereClause)
      .orderBy(desc(clients.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(clients)
      .where(whereClause);

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
    console.error("Admin clients error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();

    if (!body.brandName?.trim() || !body.taxId?.trim() || !body.contactName?.trim()) {
      return NextResponse.json(
        { error: "品牌名稱、統編、聯絡人為必填欄位" },
        { status: 400 }
      );
    }

    const clientNumber = await generateClientNumber();

    const [newClient] = await db
      .insert(clients)
      .values({
        clientNumber,
        brandName: body.brandName,
        industry: body.industry || null,
        contactName: body.contactName,
        contactEmail: body.contactEmail || null,
        contactPhone: body.contactPhone || null,
        taxId: body.taxId,
        company: body.company || null,
        website: body.website || null,
        status: body.status || "prospect",
        planTier: body.planTier || null,
        monthlyFee: body.monthlyFee || null,
        contractStart: body.contractStart || null,
        contractEnd: body.contractEnd || null,
        submissionId: body.submissionId || null,
        assignedTo: body.assignedTo || null,
        note: body.note || null,
      })
      .returning();

    return NextResponse.json(newClient, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create client error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
