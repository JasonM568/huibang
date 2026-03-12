import { db } from "@/lib/db";
import { apiUsageLogs } from "@/lib/db/schema";

// Sonnet 4 pricing (per 1M tokens)
const PRICING: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-20250514": { input: 3, output: 15 },
};

const DEFAULT_PRICING = { input: 3, output: 15 };

interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
}

export async function logApiUsage(
  endpoint: string,
  model: string,
  usage: TokenUsage,
  userId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const pricing = PRICING[model] || DEFAULT_PRICING;
    const costUsd =
      (usage.input_tokens * pricing.input) / 1_000_000 +
      (usage.output_tokens * pricing.output) / 1_000_000;

    await db.insert(apiUsageLogs).values({
      endpoint,
      model,
      inputTokens: usage.input_tokens,
      outputTokens: usage.output_tokens,
      costUsd: costUsd.toFixed(6),
      userId: userId || null,
      metadata: metadata || null,
    });
  } catch (error) {
    // Silent fail — 不影響主流程
    console.error("Failed to log API usage:", error);
  }
}
