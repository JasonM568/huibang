import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";
import { logApiUsage } from "@/lib/api-usage";

const SYSTEM_PROMPT = `你是一位專業的社群媒體內容策略師，擅長為品牌創作高互動率的社群貼文。

你的任務是根據使用者提供的品牌資訊和貼文需求，生成高品質的社群貼文。

## 輸出格式

請生成以下 3 個版本的貼文：

### 📱 Instagram / Facebook 版本
[貼文內容：150-300 字，包含吸睛開頭、核心價值、行動呼籲（CTA），結尾加上 5-8 個精選 Hashtag]

### 🧵 Threads / 小紅書 版本
[貼文內容：100-200 字，輕鬆口語化，像在和朋友聊天，可以用分段落增加可讀性，結尾自然帶出行動呼籲]

### 🎯 附加建議
- **最佳發文時間：** [根據目標受眾建議]
- **搭配視覺建議：** [建議搭配什麼類型的圖片或影片]
- **互動技巧：** [一個提升留言/分享的小技巧]

## 注意事項
- 開頭必須有吸引力，讓人想繼續讀下去
- 避免過度銷售感，保持真實自然
- Hashtag 要精準相關，不要亂用熱門標籤
- 每個版本都要有明確的 CTA（行動呼籲）
- 語氣要符合使用者選擇的風格
- 如果使用者要求修改或微調，只輸出修改後的版本即可，不需要重複輸出所有版本`;

export async function POST(request: Request) {
  try {
    await requireAuth();

    const body = await request.json();
    const { messages, brandContext } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Missing messages" }, { status: 400 });
    }

    const client = new Anthropic();

    // 組合系統提示
    let systemPrompt = SYSTEM_PROMPT;
    if (brandContext) {
      systemPrompt += `\n\n## 品牌背景資訊\n${brandContext}`;
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    });

    logApiUsage("content-studio", "claude-sonnet-4-20250514", response.usage);

    const text = response.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("");

    return NextResponse.json({ content: text });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Content studio error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
