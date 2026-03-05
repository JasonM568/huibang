import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { diagnosticTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

// GET /api/diagnostic/token?token=xxx — 驗證 token 狀態（前端進入問卷前呼叫）
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ valid: false, reason: "missing" }, { status: 400 });
  }

  try {
    const [record] = await db
      .select()
      .from(diagnosticTokens)
      .where(eq(diagnosticTokens.token, token))
      .limit(1);

    if (!record) {
      return NextResponse.json({ valid: false, reason: "not_found" });
    }
    if (record.status === "used") {
      return NextResponse.json({ valid: false, reason: "used" });
    }
    if (record.status === "expired" || record.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, reason: "expired" });
    }

    return NextResponse.json({
      valid: true,
      contactName: record.contactName,
      email: record.email,
    });
  } catch (error) {
    console.error("Token verify error:", error);
    return NextResponse.json({ valid: false, reason: "error" }, { status: 500 });
  }
}

// POST /api/diagnostic/token — Admin 產生新 token（需要登入）
export async function POST(request: Request) {
  // 驗證 Admin 身份
  const cookieStore = await cookies();
  const authToken = cookieStore.get("admin_token")?.value;
  if (!authToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const payload = verifyToken(authToken);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email, contactName, note } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 30 天效期
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const [newToken] = await db
      .insert(diagnosticTokens)
      .values({
        email,
        contactName: contactName || null,
        note: note || null,
        expiresAt,
        status: "unused",
      })
      .returning();

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://huibang.com.tw";
    const diagnosticUrl = `${baseUrl}/diagnostic?token=${newToken.token}`;

    return NextResponse.json({
      success: true,
      token: newToken.token,
      url: diagnosticUrl,
      expiresAt: newToken.expiresAt,
    });
  } catch (error) {
    console.error("Create token error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
