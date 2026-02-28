import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { submissions, contactSubmissions } from "@/lib/db/schema";
import { sql, eq, gte } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 問卷統計
    const [questTotal] = await db
      .select({ count: sql<number>`count(*)` })
      .from(submissions);

    const [questThisMonth] = await db
      .select({ count: sql<number>`count(*)` })
      .from(submissions)
      .where(gte(submissions.createdAt, thirtyDaysAgo));

    const [questThisWeek] = await db
      .select({ count: sql<number>`count(*)` })
      .from(submissions)
      .where(gte(submissions.createdAt, sevenDaysAgo));

    // 問卷各狀態統計
    const questStatusRows = await db
      .select({
        status: submissions.status,
        count: sql<number>`count(*)`,
      })
      .from(submissions)
      .groupBy(submissions.status);

    const questByStatus: Record<string, number> = {};
    questStatusRows.forEach((r) => {
      questByStatus[r.status] = Number(r.count);
    });

    // 問卷產業分布
    const industryRows = await db
      .select({
        industry: submissions.industry,
        count: sql<number>`count(*)`,
      })
      .from(submissions)
      .groupBy(submissions.industry)
      .orderBy(sql`count(*) desc`)
      .limit(8);

    // 平均分數
    const [avgScore] = await db
      .select({
        avg: sql<number>`avg((analysis->>'overall_score')::numeric)`,
      })
      .from(submissions)
      .where(sql`analysis->>'overall_score' is not null`);

    // 聯絡表單統計
    let contactTotal = { count: 0 };
    let contactUnread = { count: 0 };
    let contactThisWeek = { count: 0 };
    try {
      [contactTotal] = await db
        .select({ count: sql<number>`count(*)` })
        .from(contactSubmissions);

      [contactUnread] = await db
        .select({ count: sql<number>`count(*)` })
        .from(contactSubmissions)
        .where(eq(contactSubmissions.status, "unread"));

      [contactThisWeek] = await db
        .select({ count: sql<number>`count(*)` })
        .from(contactSubmissions)
        .where(gte(contactSubmissions.createdAt, sevenDaysAgo));
    } catch {
      // table might not exist yet
    }

    // 最近 30 天每日提交數
    const dailyRows = await db
      .select({
        date: sql<string>`to_char(created_at, 'MM/DD')`,
        count: sql<number>`count(*)`,
      })
      .from(submissions)
      .where(gte(submissions.createdAt, thirtyDaysAgo))
      .groupBy(sql`to_char(created_at, 'MM/DD')`)
      .orderBy(sql`to_char(created_at, 'MM/DD')`);

    return NextResponse.json({
      questionnaire: {
        total: Number(questTotal.count),
        thisMonth: Number(questThisMonth.count),
        thisWeek: Number(questThisWeek.count),
        byStatus: questByStatus,
        avgScore: avgScore.avg ? Math.round(Number(avgScore.avg)) : null,
      },
      contact: {
        total: Number(contactTotal.count),
        unread: Number(contactUnread.count),
        thisWeek: Number(contactThisWeek.count),
      },
      charts: {
        daily: dailyRows.map((r) => ({ date: r.date, count: Number(r.count) })),
        industry: industryRows.map((r) => ({
          name: r.industry || "未填",
          count: Number(r.count),
        })),
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
