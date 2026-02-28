import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface AnalysisResult {
  overall_score: number;
  dimensions: {
    brand_clarity: { score: number; label: string; comment: string };
    target_audience: { score: number; label: string; comment: string };
    competitive_diff: { score: number; label: string; comment: string };
    marketing_health: { score: number; label: string; comment: string };
    growth_readiness: { score: number; label: string; comment: string };
  };
  summary: string;
  top_recommendations: string[];
}

export async function analyzeBrand(
  answers: Record<string, unknown>,
  brandName: string,
  industry: string
): Promise<AnalysisResult> {
  const prompt = `你是一位資深品牌策略顧問，擁有 15 年以上的品牌定位經驗。
以下是「${brandName}」（${industry}產業）填寫的品牌自我檢測問卷結果。

請根據問卷回答，為此品牌進行快速健檢分析，產出以下 JSON 格式的評估結果：

{
  "overall_score": 0-100 的總分,
  "dimensions": {
    "brand_clarity": { "score": 0-100, "label": "品牌清晰度", "comment": "50字以內的評語" },
    "target_audience": { "score": 0-100, "label": "目標客群認知", "comment": "50字以內的評語" },
    "competitive_diff": { "score": 0-100, "label": "競爭差異化", "comment": "50字以內的評語" },
    "marketing_health": { "score": 0-100, "label": "行銷健康度", "comment": "50字以內的評語" },
    "growth_readiness": { "score": 0-100, "label": "成長準備度", "comment": "50字以內的評語" }
  },
  "summary": "100字以內的品牌健檢總結",
  "top_recommendations": ["建議1", "建議2", "建議3"]
}

評分依據：
- brand_clarity：根據 Q1-Q5（品牌核心認知）的回答完整度與一致性
- target_audience：根據 Q10-Q13（目標客群）的描述具體程度
- competitive_diff：根據 Q14-Q17（競爭環境）的差異化清晰度
- marketing_health：根據 Q18-Q21（行銷現況）的投入程度與策略性
- growth_readiness：根據 Q22-Q25（願景目標）的明確性與可行性

注意：
1. 分數要合理，不要全部給高分或低分，要有區分度
2. 評語要具體且有洞察，避免空泛
3. 建議要可執行，針對最弱的維度提供
4. 總結要讓客戶覺得有價值，但也意識到需要專業協助
5. 僅回覆 JSON，不要加其他文字

以下是問卷回答：
${JSON.stringify(answers, null, 2)}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result: AnalysisResult = JSON.parse(jsonStr);

    return result;
  } catch (error) {
    console.error("AI analysis error:", error);
    // Fallback: return a default analysis
    return {
      overall_score: 50,
      dimensions: {
        brand_clarity: { score: 50, label: "品牌清晰度", comment: "需要進一步評估，建議與專業顧問討論" },
        target_audience: { score: 50, label: "目標客群認知", comment: "需要進一步評估，建議與專業顧問討論" },
        competitive_diff: { score: 50, label: "競爭差異化", comment: "需要進一步評估，建議與專業顧問討論" },
        marketing_health: { score: 50, label: "行銷健康度", comment: "需要進一步評估，建議與專業顧問討論" },
        growth_readiness: { score: 50, label: "成長準備度", comment: "需要進一步評估，建議與專業顧問討論" },
      },
      summary: "由於系統暫時無法完成完整分析，我們的顧問團隊將在 3-5 個工作日內手動為您完成品牌健檢報告。",
      top_recommendations: [
        "建議預約免費諮詢，由顧問為您進行完整分析",
        "可先整理品牌的核心價值與差異化優勢",
        "收集近期的行銷數據以便進行更精確的評估",
      ],
    };
  }
}
