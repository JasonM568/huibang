import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientStrategies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const [strategy] = await db
      .select()
      .from(clientStrategies)
      .where(eq(clientStrategies.clientId, id))
      .limit(1);

    if (!strategy) {
      return NextResponse.json({ error: "Strategy not found" }, { status: 404 });
    }

    return NextResponse.json(strategy);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get strategy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Upsert: 建立或更新品牌策略
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id: clientId } = await params;
    const body = await request.json();

    const strategyData = {
      clientId,
      updatedAt: new Date(),
      // 品牌人設
      brandPersonality: body.brandPersonality || null,
      brandTone: body.brandTone || null,
      brandTaboos: body.brandTaboos || null,
      // 受眾輪廓
      audienceAge: body.audienceAge || null,
      audienceGender: body.audienceGender || null,
      audienceLocation: body.audienceLocation || null,
      audienceOccupation: body.audienceOccupation || null,
      audiencePainPoints: body.audiencePainPoints || null,
      audiencePlatforms: body.audiencePlatforms || null,
      audienceDecisionFactors: body.audienceDecisionFactors || null,
      // 品牌聲量
      valueProposition: body.valueProposition || null,
      keyMessages: body.keyMessages || null,
      competitorDiff: body.competitorDiff || null,
      // 經營設定
      platforms: body.platforms || null,
      platformPositions: body.platformPositions || null,
      postFrequency: body.postFrequency || null,
      kpiTargets: body.kpiTargets || null,
    };

    // 檢查是否已有策略
    const [existing] = await db
      .select({ id: clientStrategies.id })
      .from(clientStrategies)
      .where(eq(clientStrategies.clientId, clientId))
      .limit(1);

    let result;
    if (existing) {
      // 更新
      [result] = await db
        .update(clientStrategies)
        .set(strategyData)
        .where(eq(clientStrategies.clientId, clientId))
        .returning();
    } else {
      // 新建
      [result] = await db
        .insert(clientStrategies)
        .values(strategyData)
        .returning();
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Upsert strategy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
