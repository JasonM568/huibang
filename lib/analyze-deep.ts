import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ===== 深度健診報告格式 =====
export interface DeepAnalysisResult {
  // 第一區塊：帳號整體評分
  overall_score: number; // 0-100
  health_level: "危險" | "待改善" | "尚可" | "良好";
  health_summary: string; // 一句話總評

  // 第二區塊：第一印象診斷
  first_impression: {
    what_works: string;    // 做對的事（先建立信任）
    critical_gap: string;  // 陌生人視角的核心問題
    bio_diagnosis: string; // 帳號定位/簡介的具體建議
  };

  // 第三區塊：內容策略診斷
  content_strategy: {
    pattern_found: string;   // 目前內容模式描述
    conversion_gap: string;  // 為什麼沒有轉換
    missing_element: string; // 最缺少的關鍵要素
  };

  // 第四區塊：數據盲點
  data_blindspot: {
    awareness_level: "清楚" | "模糊" | "完全不知道";
    risk_statement: string;       // 不知道數據帶來的具體風險
    what_they_are_missing: string; // 他們目前錯過的機會
  };

  // 第五區塊：優先改善清單
  priority_actions: {
    immediate: Array<{         // 本週可做（0 成本，只需要時間）
      title: string;
      specific_action: string; // 具體到今天就能執行的步驟
      time_required: string;   // 例如：15 分鐘
    }>;
    this_month: Array<{        // 本月建立機制
      title: string;
      why_important: string;
      first_step: string;
    }>;
    needs_system: Array<{      // 需要系統支援才能真正解決
      title: string;
      why_hard_alone: string;  // 為什麼自己做會卡關
    }>;
  };

  // 第六區塊：自然轉介語
  transition_message: string; // 引導到社群經營方案的一段話
}

export async function analyzeDeepDiagnostic(
  answers: Record<string, unknown>
): Promise<DeepAnalysisResult> {
  const prompt = `你是一位專精台灣中小品牌社群經營的帳號健診專家，擁有豐富的社群策略實戰經驗。

以下是一位品牌主填寫的「深度社群帳號健診問卷」答案。

請根據答案，產出一份讓品牌主「感覺被真正看見」的書面健診報告。

---

【語氣要求】
- 像一個懂社群的朋友在說實話，不是顧問在做簡報
- 先說他做對的地方（建立信任），再點出問題（要具體不要空泛）
- 「本週立即處理」的建議必須具體到「今天打開手機就能做」
- 「需要系統支援」的部分，說清楚「為什麼自己做會卡關」，不要直接說「建議找專業團隊」
- 用繁體中文，口語但不失專業

---

【評分邏輯】
- s1~s5（帳號基本狀態）：判斷帳號成熟度與管理資源
- s6~s8（內容策略）：判斷內容是否有方向與一致性
- s9~s11（數據掌握）：判斷是否具備優化能力
- s12~s15（定位認知）：判斷帳號第一印象與差異化
- s16~s18（轉換設計）：判斷社群與業績的連結度
- s19~s21（資源痛點）：判斷自行處理的可行性

---

【輸出格式】
請產出以下 JSON 格式，僅回覆 JSON，不要加其他文字：

{
  "overall_score": 0-100的整數,
  "health_level": "危險" 或 "待改善" 或 "尚可" 或 "良好",
  "health_summary": "一句話總評（20字以內，直接說重點）",

  "first_impression": {
    "what_works": "他目前做對的一件事（1-2句，要具體）",
    "critical_gap": "陌生人看到帳號最大的問題（2-3句，要有畫面感）",
    "bio_diagnosis": "帳號定位/簡介的具體改善建議（2-3句，要可執行）"
  },

  "content_strategy": {
    "pattern_found": "目前內容模式的描述（2句，不批評，客觀陳述）",
    "conversion_gap": "為什麼現有內容沒辦法帶來詢問（2-3句，要找到根本原因）",
    "missing_element": "最缺少的一個關鍵要素（1-2句，要具體說是什麼）"
  },

  "data_blindspot": {
    "awareness_level": "清楚" 或 "模糊" 或 "完全不知道",
    "risk_statement": "不知道數據帶來的具體風險（2句）",
    "what_they_are_missing": "他們目前錯過的機會（2句）"
  },

  "priority_actions": {
    "immediate": [
      {
        "title": "行動標題（8字以內）",
        "specific_action": "具體步驟，例如：打開IG，點右上角→設定→帳號→編輯個人資料，把Bio改成這個格式：[你服務誰] + [他們能得到什麼] + [行動呼籲]",
        "time_required": "15分鐘"
      }
    ],
    "this_month": [
      {
        "title": "機制標題（8字以內）",
        "why_important": "為什麼這個月要做這件事（1-2句）",
        "first_step": "第一步怎麼開始（要具體）"
      }
    ],
    "needs_system": [
      {
        "title": "問題標題（8字以內）",
        "why_hard_alone": "為什麼這個問題自己處理會卡關（2句，要誠實說明現實困難）"
      }
    ]
  },

  "transition_message": "2-3句話，誠實告訴品牌主：你現在面對的這些問題，需要多少時間和精力才能自己解決。如果有人幫你系統性處理，可以節省什麼。語氣要真誠，不要像廣告文案。"
}

---

【重要注意事項】
1. overall_score 要有區分度：0-40（危險）、41-65（待改善）、66-80（尚可）、81-100（良好）
2. immediate 建議要有 2-3 項，this_month 要有 1-2 項，needs_system 要有 1-2 項
3. 每一條建議都要針對這個品牌主的具體回答，不要給通用建議
4. transition_message 不要出現「惠邦」、「我們的服務」等字眼，而是說「這樣的問題通常需要...」

---

以下是問卷答案：
${JSON.stringify(answers, null, 2)}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    const jsonStr = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const result: DeepAnalysisResult = JSON.parse(jsonStr);
    return result;
  } catch (error) {
    console.error("Deep analysis error:", error);
    // Fallback
    return {
      overall_score: 50,
      health_level: "待改善",
      health_summary: "系統暫時無法完成分析，請稍後重試",
      first_impression: {
        what_works: "你已經踏出經營社群的第一步，這是很好的開始。",
        critical_gap: "由於系統暫時無法完成分析，我們的團隊將在 1 個工作天內手動為你完成報告。",
        bio_diagnosis: "請稍候，我們會盡快與你聯繫。",
      },
      content_strategy: {
        pattern_found: "分析進行中，請稍候。",
        conversion_gap: "分析進行中，請稍候。",
        missing_element: "分析進行中，請稍候。",
      },
      data_blindspot: {
        awareness_level: "模糊",
        risk_statement: "分析進行中，請稍候。",
        what_they_are_missing: "分析進行中，請稍候。",
      },
      priority_actions: {
        immediate: [
          {
            title: "等待分析結果",
            specific_action: "我們的系統正在處理你的問卷，請留意 Email 通知。",
            time_required: "—",
          },
        ],
        this_month: [
          {
            title: "確認報告內容",
            why_important: "收到報告後，優先確認最緊急的改善項目。",
            first_step: "查看 Email 中的報告連結。",
          },
        ],
        needs_system: [],
      },
      transition_message: "你的報告正在準備中，我們的團隊會盡快完成並通知你。",
    };
  }
}
