// ===== 深度社群帳號健診 問卷結構定義 =====
// 與免費品牌健檢問卷（questionnaire-data.ts）完全分開
// 聚焦「社群帳號深度診斷」，不重複基礎資料類問題

import { QuestionOption, Question, QuestionnaireStep } from "./questionnaire-data";

export const deepQuestionnaireSteps: QuestionnaireStep[] = [
  // ─────────────────────────────────────────
  // 區塊 A：帳號事實盤點（S1~S11）
  // ─────────────────────────────────────────
  {
    id: "account",
    title: "帳號基本狀態",
    subtitle: "讓我們先了解你的社群帳號現況",
    icon: "📱",
    questions: [
      {
        id: "s1",
        label: "你主要經營哪個社群平台？（主力帳號）",
        type: "radio",
        required: true,
        options: [
          { value: "Instagram", label: "Instagram" },
          { value: "Facebook 粉專", label: "Facebook 粉絲專頁" },
          { value: "TikTok", label: "TikTok" },
          { value: "YouTube", label: "YouTube" },
          { value: "小紅書", label: "小紅書" },
          { value: "Threads", label: "Threads" },
          { value: "其他", label: "其他" },
        ],
      },
      {
        id: "s1_url",
        label: "這個帳號的連結或帳號名稱",
        type: "text",
        placeholder: "例如：@huibang.tw 或 https://www.instagram.com/huibang.tw",
        required: true,
        helpText: "方便我們查看你的帳號現況",
      },
      {
        id: "s2",
        label: "這個帳號目前的追蹤數大約是？",
        type: "radio",
        required: true,
        options: [
          { value: "500以下", label: "500 以下" },
          { value: "500-2000", label: "500 ~ 2,000" },
          { value: "2000-5000", label: "2,000 ~ 5,000" },
          { value: "5000-10000", label: "5,000 ~ 10,000" },
          { value: "1萬-5萬", label: "1 萬 ~ 5 萬" },
          { value: "5萬以上", label: "5 萬以上" },
        ],
      },
      {
        id: "s3",
        label: "這個帳號開始經營多久了？",
        type: "radio",
        options: [
          { value: "半年以內", label: "半年以內" },
          { value: "半年-1年", label: "半年 ~ 1 年" },
          { value: "1-3年", label: "1 ~ 3 年" },
          { value: "3年以上", label: "3 年以上" },
        ],
      },
      {
        id: "s4",
        label: "目前平均發文頻率是？",
        type: "radio",
        required: true,
        options: [
          { value: "幾乎不發", label: "幾乎不發（一個月不到 1 篇）" },
          { value: "每月1-3篇", label: "每月 1-3 篇" },
          { value: "每週1-2篇", label: "每週 1-2 篇" },
          { value: "每週3篇以上", label: "每週 3 篇以上" },
          { value: "幾乎每天", label: "幾乎每天" },
        ],
      },
      {
        id: "s5",
        label: "帳號目前由誰在管理？",
        type: "radio",
        options: [
          { value: "老闆本人", label: "老闆 / 負責人本人" },
          { value: "內部專職行銷", label: "內部專職行銷人員" },
          { value: "內部兼職", label: "內部兼職處理" },
          { value: "外包個人", label: "外包給個人接案" },
          { value: "外包公司", label: "外包給行銷公司" },
        ],
      },
    ],
  },
  {
    id: "content",
    title: "內容策略現況",
    subtitle: "了解你目前的內容方向與一致性",
    icon: "✍️",
    questions: [
      {
        id: "s6",
        label: "你目前發的內容，主要是哪幾種類型？",
        type: "checkbox",
        helpText: "最多選 3 項",
        options: [
          { value: "產品介紹", label: "產品 / 服務介紹" },
          { value: "優惠活動", label: "優惠 / 促銷活動" },
          { value: "客戶見證", label: "客戶見證 / 評價" },
          { value: "知識分享", label: "知識分享 / 教學" },
          { value: "品牌故事", label: "品牌故事 / 理念" },
          { value: "日常生活感", label: "日常 / 生活感內容" },
          { value: "員工幕後", label: "員工 / 幕後花絮" },
          { value: "沒有固定類型", label: "沒有固定類型，想到什麼發什麼" },
        ],
      },
      {
        id: "s7",
        label: "你有固定的內容規劃（月曆或排程）嗎？",
        type: "radio",
        required: true,
        options: [
          { value: "有嚴格執行", label: "有，而且嚴格照表執行" },
          { value: "有但沒照做", label: "有，但常常沒照計畫走" },
          { value: "沒有想到再發", label: "沒有，想到什麼發什麼" },
          { value: "沒有不知道怎麼規劃", label: "沒有，也不知道怎麼規劃" },
        ],
      },
      {
        id: "s8",
        label: "你的發文有沒有固定的視覺風格或設計規範？",
        type: "radio",
        options: [
          { value: "有統一視覺", label: "有統一的視覺識別（固定色系、字型、版型）" },
          { value: "大致一致", label: "大致有一致感，但不嚴格" },
          { value: "每篇不一樣", label: "每篇風格不太一樣" },
          { value: "完全沒有規範", label: "完全沒有規範" },
        ],
      },
    ],
  },
  {
    id: "data",
    title: "數據掌握程度",
    subtitle: "了解你對帳號表現的掌握度",
    icon: "📊",
    questions: [
      {
        id: "s9",
        label: "你知道帳號過去 30 天的平均觸及人數嗎？",
        type: "radio",
        required: true,
        options: [
          { value: "知道可以說出數字", label: "知道，可以說出大概數字" },
          { value: "大概知道", label: "大概知道，但說不出精確數字" },
          { value: "完全不知道", label: "完全不知道" },
          { value: "不知道怎麼看", label: "不知道怎麼看這個數據" },
        ],
      },
      {
        id: "s10",
        label: "你知道帳號的平均互動率大概是多少嗎？",
        type: "radio",
        options: [
          { value: "知道", label: "知道（讚、留言、分享加起來的比例）" },
          { value: "大概知道", label: "大概知道" },
          { value: "不知道", label: "不知道" },
          { value: "不知道怎麼算", label: "不知道怎麼計算" },
        ],
      },
      {
        id: "s11",
        label: "你有辦法追蹤社群帶來了多少詢問或成交嗎？",
        type: "radio",
        required: true,
        options: [
          { value: "可以精確追蹤", label: "可以精確追蹤（有用工具或系統）" },
          { value: "大概估得到", label: "大概估得到" },
          { value: "完全沒辦法追蹤", label: "完全沒辦法追蹤" },
          { value: "從來沒想過", label: "從來沒想過要追蹤這件事" },
        ],
      },
    ],
  },
  // ─────────────────────────────────────────
  // 區塊 B：主觀認知探測（S12~S21）
  // ─────────────────────────────────────────
  {
    id: "perception",
    title: "帳號定位與第一印象",
    subtitle: "從陌生人的角度看你的帳號",
    icon: "🪞",
    questions: [
      {
        id: "s12",
        label: "一個從來沒聽過你的人，第一次看到你的帳號主頁，能在 10 秒內看懂你是做什麼、服務誰、為什麼要追蹤你嗎？",
        type: "radio",
        required: true,
        options: [
          { value: "絕對可以", label: "絕對可以" },
          { value: "應該可以", label: "應該可以" },
          { value: "不確定", label: "我不確定" },
          { value: "可能看不懂", label: "可能看不懂" },
        ],
      },
      {
        id: "s13",
        label: "用一句話描述你的帳號：「我的帳號是給＿＿看的，他們可以在這裡得到＿＿」",
        type: "textarea",
        placeholder: "例如：我的帳號是給想創業的上班族看的，他們可以在這裡得到每週一個可執行的副業啟動技巧",
        required: true,
        helpText: "試著完成這個句子，說不出來也沒關係，直接寫你的想法",
      },
      {
        id: "s14",
        label: "跟你做類似產品 / 服務的競品，他們的社群帳號你有定期觀察過嗎？",
        type: "radio",
        options: [
          { value: "有很清楚", label: "有，很清楚他們在做什麼" },
          { value: "偶爾看", label: "偶爾看一下" },
          { value: "很少", label: "很少" },
          { value: "從來沒有", label: "從來沒有刻意觀察" },
        ],
      },
      {
        id: "s15",
        label: "如果競品的粉絲看到你的帳號，他們有沒有明確理由追蹤你而不是繼續追蹤對方？",
        type: "radio",
        required: true,
        options: [
          { value: "有能說清楚", label: "有，我能清楚說出來" },
          { value: "有感覺說不清楚", label: "有感覺，但說不太清楚" },
          { value: "沒想過", label: "沒有想過這個問題" },
          { value: "目前沒有差異", label: "老實說目前沒有明顯差異" },
        ],
      },
    ],
  },
  {
    id: "conversion",
    title: "內容與業績連結",
    subtitle: "你的社群有在幫你賺錢嗎？",
    icon: "💰",
    questions: [
      {
        id: "s16",
        label: "你過去發的貼文，有沒有哪篇帶來明顯的詢問或成交？",
        type: "radio",
        required: true,
        options: [
          { value: "有知道是哪篇", label: "有，而且知道是哪篇、帶來什麼效果" },
          { value: "有感覺但說不出", label: "有感覺有，但說不出是哪篇" },
          { value: "沒有印象", label: "沒有印象有過" },
          { value: "完全沒有", label: "完全沒有帶來詢問" },
        ],
      },
      {
        id: "s17",
        label: "你覺得你的社群內容，現在對業績有貢獻嗎？",
        type: "radio",
        required: true,
        options: [
          { value: "有明顯貢獻", label: "有明顯貢獻，社群是主要來客管道之一" },
          { value: "有一點點", label: "有一點點，但不多" },
          { value: "幾乎沒有", label: "幾乎沒有感覺到" },
          { value: "完全不知道", label: "完全不知道，因為沒辦法追蹤" },
        ],
      },
      {
        id: "s18",
        label: "你的帳號裡，有沒有清楚的「行動呼籲」（CTA）引導粉絲採取下一步？",
        type: "radio",
        helpText: "例如：私訊詢問、點連結、預約、購買等引導",
        options: [
          { value: "每篇都有", label: "幾乎每篇都有明確 CTA" },
          { value: "有時候有", label: "有時候有" },
          { value: "很少", label: "很少主動引導" },
          { value: "幾乎沒有", label: "幾乎沒有，都是讓人看完就走" },
        ],
      },
    ],
  },
  {
    id: "resources",
    title: "痛點與資源盤點",
    subtitle: "最後幾題，幫助我們給出最貼切的建議",
    icon: "🔧",
    questions: [
      {
        id: "s19",
        label: "社群經營上，最消耗你時間或精力的事是什麼？",
        type: "checkbox",
        helpText: "最多選 2 項",
        options: [
          { value: "想不到要發什麼", label: "想不到要發什麼內容" },
          { value: "拍照製作素材", label: "拍照或製作視覺素材" },
          { value: "寫文案", label: "寫文案、想標題" },
          { value: "排版設計", label: "排版設計" },
          { value: "維持發文頻率", label: "維持穩定的發文頻率" },
          { value: "回覆留言私訊", label: "回覆留言和私訊" },
          { value: "分析數據", label: "看數據、分析表現" },
          { value: "以上都很耗時", label: "以上幾乎都很耗時" },
        ],
      },
      {
        id: "s20",
        label: "你覺得你的帳號現在最大的問題是什麼？",
        type: "textarea",
        placeholder: "用你自己的話說，不用很正式",
        required: true,
        helpText: "例如：發了很多但沒人互動、不知道要發什麼、粉絲沒有成長...",
      },
      {
        id: "s21",
        label: "如果社群做好了，你最希望達到什麼具體結果？",
        type: "textarea",
        placeholder: "例如：每個月從社群帶來 10 個詢問、粉絲從 500 成長到 2000...",
        required: true,
        helpText: "越具體越好，這會直接影響我們給你的建議方向",
      },
    ],
  },
];

// 深度問卷答案類型
export interface DeepQuestionnaireAnswers {
  [key: string]: string | string[];
}
