import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { diagnosticTokens } from "@/lib/db/schema";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { desc } from "drizzle-orm";

// GET /api/admin/diagnostic-tokens — 取得所有 tokens（需要 Admin 登入）
export async function GET() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("admin_token")?.value;
  if (!authToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = verifyToken(authToken);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const tokens = await db
      .select()
      .from(diagnosticTokens)
      .orderBy(desc(diagnosticTokens.createdAt));
    return NextResponse.json(tokens);
  } catch (error) {
    console.error("Get tokens error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
