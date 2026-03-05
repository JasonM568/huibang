import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { diagnosticSubmissions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/diagnostic/[id] — 取得深度健診報告
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [submission] = await db
      .select()
      .from(diagnosticSubmissions)
      .where(eq(diagnosticSubmissions.id, id))
      .limit(1);

    if (!submission) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Get diagnostic error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
