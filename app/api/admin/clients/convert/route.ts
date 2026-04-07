import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { submissions, clients } from "@/lib/db/schema";
import { eq, like, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

async function generateClientNumber() {
  const now = new Date();
  const mm = (now.getMonth() + 1).toString().padStart(2, "0");
  const dd = now.getDate().toString().padStart(2, "0");
  const yy = now.getFullYear().toString().slice(-2);
  const dateStr = `${mm}${dd}${yy}`;
  const prefix = `C-${dateStr}-`;

  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(clients)
    .where(like(clients.clientNumber, `${prefix}%`));

  const seq = Number(result?.count || 0) + 1;
  return `${prefix}${seq}`;
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const { submissionId } = await request.json();

    if (!submissionId) {
      return NextResponse.json({ error: "submissionId is required" }, { status: 400 });
    }

    // 取得問卷資料
    const [submission] = await db
      .select()
      .from(submissions)
      .where(eq(submissions.id, submissionId))
      .limit(1);

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // 檢查是否已經轉過
    const [existingClient] = await db
      .select({ id: clients.id })
      .from(clients)
      .where(eq(clients.submissionId, submissionId))
      .limit(1);

    if (existingClient) {
      return NextResponse.json(
        { error: "此問卷已轉為客戶", clientId: existingClient.id },
        { status: 409 }
      );
    }

    // 建立客戶，帶入問卷資料
    const clientNumber = await generateClientNumber();

    const [newClient] = await db
      .insert(clients)
      .values({
        clientNumber,
        brandName: submission.brandName || "未命名品牌",
        industry: submission.industry || null,
        contactName: submission.contactName || null,
        contactEmail: submission.contactInfo || "",
        contactPhone: "",
        taxId: "",
        website: submission.website || null,
        status: "prospect",
        submissionId: submission.id,
        assignedTo: submission.assignedTo || null,
      })
      .returning();

    // 更新問卷狀態為 converted
    await db
      .update(submissions)
      .set({ status: "converted" })
      .where(eq(submissions.id, submissionId));

    return NextResponse.json(newClient, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Convert to client error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
