import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients, clientStrategies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // 取得策略資料
    const [strategy] = await db
      .select()
      .from(clientStrategies)
      .where(eq(clientStrategies.clientId, id))
      .limit(1);

    return NextResponse.json({ ...client, strategy: strategy || null });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get client error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();

    const updates: Record<string, any> = {};
    const allowedFields = [
      "brandName", "industry", "contactName", "contactEmail", "contactPhone",
      "taxId", "company", "website", "status", "planTier", "monthlyFee",
      "contractStart", "contractEnd", "assignedTo", "note",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }
    updates.updatedAt = new Date();

    const [updated] = await db
      .update(clients)
      .set(updates)
      .where(eq(clients.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update client error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // clientStrategies 有 onDelete: cascade，會自動刪除
    await db.delete(clients).where(eq(clients.id, id));

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Delete client error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
