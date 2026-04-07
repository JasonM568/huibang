import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { loginLogs, adminUsers } from "@/lib/db/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await requireAuth();
    if (session.role !== "admin") {
      return NextResponse.json({ error: "需要管理員權限" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // 近 30 天
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await db
      .select({
        id: loginLogs.id,
        loginAt: loginLogs.loginAt,
        ip: loginLogs.ip,
        userAgent: loginLogs.userAgent,
      })
      .from(loginLogs)
      .where(and(eq(loginLogs.userId, userId), gte(loginLogs.loginAt, thirtyDaysAgo)))
      .orderBy(desc(loginLogs.loginAt))
      .limit(100);

    return NextResponse.json(logs);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
