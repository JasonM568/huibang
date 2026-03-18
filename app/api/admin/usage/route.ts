import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiUsageLogs } from "@/lib/db/schema";
import { sql, gte, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAuth();

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 本月統計
    const [thisMonth] = await db
      .select({
        count: sql<number>`count(*)`,
        totalInput: sql<number>`coalesce(sum(input_tokens), 0)`,
        totalOutput: sql<number>`coalesce(sum(output_tokens), 0)`,
        totalCost: sql<number>`coalesce(sum(cost_usd::numeric), 0)`,
      })
      .from(apiUsageLogs)
      .where(gte(apiUsageLogs.createdAt, thisMonthStart));

    // 上月統計
    const [lastMonth] = await db
      .select({
        count: sql<number>`count(*)`,
        totalCost: sql<number>`coalesce(sum(cost_usd::numeric), 0)`,
      })
      .from(apiUsageLogs)
      .where(
        sql`created_at >= ${lastMonthStart} AND created_at < ${thisMonthStart}`
      );

    // 各 endpoint 統計（本月）
    const byEndpoint = await db
      .select({
        endpoint: apiUsageLogs.endpoint,
        count: sql<number>`count(*)`,
        totalInput: sql<number>`coalesce(sum(input_tokens), 0)`,
        totalOutput: sql<number>`coalesce(sum(output_tokens), 0)`,
        totalCost: sql<number>`coalesce(sum(cost_usd::numeric), 0)`,
      })
      .from(apiUsageLogs)
      .where(gte(apiUsageLogs.createdAt, thisMonthStart))
      .groupBy(apiUsageLogs.endpoint);

    // 近 30 天每日趨勢
    const dailyRows = await db
      .select({
        date: sql<string>`to_char(created_at, 'MM/DD')`,
        count: sql<number>`count(*)`,
        totalCost: sql<number>`coalesce(sum(cost_usd::numeric), 0)`,
      })
      .from(apiUsageLogs)
      .where(gte(apiUsageLogs.createdAt, thirtyDaysAgo))
      .groupBy(sql`to_char(created_at, 'MM/DD')`)
      .orderBy(sql`to_char(created_at, 'MM/DD')`);

    // 最近 20 筆記錄
    const recentLogs = await db
      .select()
      .from(apiUsageLogs)
      .orderBy(desc(apiUsageLogs.createdAt))
      .limit(20);

    return NextResponse.json({
      thisMonth: {
        count: Number(thisMonth.count),
        totalInput: Number(thisMonth.totalInput),
        totalOutput: Number(thisMonth.totalOutput),
        totalCost: Number(Number(thisMonth.totalCost).toFixed(4)),
      },
      lastMonth: {
        count: Number(lastMonth.count),
        totalCost: Number(Number(lastMonth.totalCost).toFixed(4)),
      },
      byEndpoint: byEndpoint.map((r) => ({
        endpoint: r.endpoint,
        count: Number(r.count),
        totalInput: Number(r.totalInput),
        totalOutput: Number(r.totalOutput),
        totalCost: Number(Number(r.totalCost).toFixed(4)),
      })),
      daily: dailyRows.map((r) => ({
        date: r.date,
        count: Number(r.count),
        cost: Number(Number(r.totalCost).toFixed(4)),
      })),
      recentLogs: recentLogs.map((r) => ({
        id: r.id,
        createdAt: r.createdAt,
        endpoint: r.endpoint,
        model: r.model,
        inputTokens: r.inputTokens,
        outputTokens: r.outputTokens,
        costUsd: r.costUsd,
      })),
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Usage API error:", errMsg, error);
    return NextResponse.json(
      { error: "Internal server error", detail: errMsg },
      { status: 500 }
    );
  }
}
