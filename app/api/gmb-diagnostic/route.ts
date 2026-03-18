import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { trialLeads } from "@/lib/db/schema";
import { logApiUsage } from "@/lib/api-usage";
import { eq, and, gte } from "drizzle-orm";

const AGENT_MAP: Record<string, string> = {
  profile: "商家檔案優化師（gmb-profile-optimizer）",
  strategy: "廣告策略規劃師（gmb-ads-strategist）",
  journey: "消費者旅程設計師（gmb-journey-designer）",
  copy: "廣告文案撰寫師（gmb-copywriter）",
  data: "廣告數據判讀師（gmb-data-analyst）",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      type,
      location,
      budget,
      starProduct,
      channels,
      problem,
      adsData,
      upcoming,
      agents,
    } = body;

    // --- Validation ---
    if (!name || !type || !location || !problem || !email) {
      return NextResponse.json(
        { error: "必填欄位不完整" },
        { status: 400 }
      );
    }

    // Auto-select all agents (users don't choose)
    const agents = ["profile", "strategy", "journey", "copy", "data"];

    // --- Rate limiting: 同一 email 24 小時內只能用一次 ---
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentUsage = await db
      .select({ id: trialLeads.id })
      .from(trialLeads)
      .where(
        and(
          eq(trialLeads.email, email),
          eq(trialLeads.source, "gmb-diagnostic"),
          gte(trialLeads.createdAt, twentyFourHoursAgo)
        )
      )
      .limit(1);

    if (recentUsage.length > 0) {
      return NextResponse.json(
        { error: "每個 Email 每 24 小時僅能使用一次，請稍後再試" },
        { status: 429 }
      );
    }

    // --- Build prompt ---
    const selectedAgentNames = agents
      .map((id: string) => AGENT_MAP[id])
      .filter(Boolean)
      .join("\n- ");

    const prompt = `你是一位 Google 我的商家暨廣告行銷的 AI 顧問。請根據以下店家資訊，提供完整的優化建議報告。

## 店家資訊
- 店名：${name}
- 類型：${type}
- 地區：${location}
- 月行銷預算：${budget || "尚未規劃"}
- 明星商品/服務特色：${starProduct || "（未填寫）"}
- 目前行銷管道：${channels || "尚未確認"}

## 目前遇到的問題
${problem}

${adsData ? `## 現有廣告數據\n${adsData}` : ""}
${upcoming ? `## 近期目標或活動\n${upcoming}` : ""}

## 請依序提供以下五個面向的分析建議：

輸出格式要求：
1. 每個面向用「=== [面向標題] ===」開頭，標題使用以下名稱：
   - === 商家檔案優化建議 ===
   - === 廣告策略規劃 ===
   - === 消費者旅程設計 ===
   - === 廣告文案建議 ===
   - === 數據指標與優化方向 ===
2. 內容要具體、可操作，針對這家店的實際情況
3. 有數字就給數字（預算/CPC/CTR 標準值）
4. 文案建議要給可直接使用的範例
5. 繁體中文，台灣在地用語
6. 每個面向約 200-300 字，簡潔有力

請開始：`;

    // --- Call Claude API ---
    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    logApiUsage("gmb-diagnostic", "claude-sonnet-4-20250514", response.usage);

    const result = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    // --- Save lead ---
    await db.insert(trialLeads).values({
      name,
      email,
      phone: phone || null,
      source: "gmb-diagnostic",
      note: `類型:${type} 地區:${location} 預算:${budget} 模組:${agents.join(",")}`,
    });

    return NextResponse.json({ result });
  } catch (error: unknown) {
    console.error("GMB diagnostic error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
