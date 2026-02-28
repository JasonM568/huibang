// ===== 問卷結構定義 =====

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "email" | "url";
  placeholder?: string;
  required?: boolean;
  options?: QuestionOption[];
  helpText?: string;
}

export interface QuestionnaireStep {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  questions: Question[];
}

// ===== 問卷步驟定義 =====
export const questionnaireSteps: QuestionnaireStep[] = [
  {
    id: "basic",
    title: "基本資料",
    subtitle: "讓我們先認識你的品牌",
    icon: "📋",
    questions: [
      {
        id: "a1",
        label: "品牌/公司名稱",
        type: "text",
        placeholder: "例如：惠邦行銷",
        required: true,
      },
      {
        id: "a2",
        label: "所屬產業",
        type: "select",
        required: true,
        options: [
          { value: "旅遊活動", label: "旅遊活動" },
          { value: "電商零售", label: "電商零售" },
          { value: "餐飲美食", label: "餐飲美食" },
          { value: "教育課程", label: "教育課程" },
          { value: "美容保養", label: "美容保養" },
          { value: "健康醫療", label: "健康醫療" },
          { value: "科技軟體", label: "科技軟體" },
          { value: "金融保險", label: "金融保險" },
          { value: "房地產", label: "房地產" },
          { value: "其他", label: "其他" },
        ],
      },
      {
        id: "a3",
        label: "成立時間",
        type: "select",
        options: [
          { value: "尚未成立", label: "尚未成立（籌備中）" },
          { value: "1年以內", label: "1 年以內" },
          { value: "1-3年", label: "1-3 年" },
          { value: "3-5年", label: "3-5 年" },
          { value: "5-10年", label: "5-10 年" },
          { value: "10年以上", label: "10 年以上" },
        ],
      },
      {
        id: "a4",
        label: "主要產品/服務",
        type: "textarea",
        placeholder: "請簡述你的核心產品或服務（例如：印度朝聖旅遊、滴雞精保健食品）",
        required: true,
      },
    ],
  },
  {
    id: "online",
    title: "線上狀態",
    subtitle: "了解你目前的數位佈局",
    icon: "🌐",
    questions: [
      {
        id: "a5",
        label: "官方網站",
        type: "url",
        placeholder: "https://www.example.com",
        helpText: "沒有可以留空",
      },
      {
        id: "a6",
        label: "主要社群平台",
        type: "checkbox",
        options: [
          { value: "Facebook 粉專", label: "Facebook 粉絲專頁" },
          { value: "Instagram", label: "Instagram" },
          { value: "LINE 官方帳號", label: "LINE 官方帳號" },
          { value: "YouTube", label: "YouTube" },
          { value: "TikTok", label: "TikTok" },
          { value: "小紅書", label: "小紅書" },
          { value: "沒有社群帳號", label: "目前沒有社群帳號" },
        ],
        helpText: "可複選",
      },
      {
        id: "a9",
        label: "公司/團隊規模",
        type: "select",
        options: [
          { value: "1人（個人品牌）", label: "1 人（個人品牌）" },
          { value: "2-5人", label: "2-5 人" },
          { value: "6-10人", label: "6-10 人" },
          { value: "11-30人", label: "11-30 人" },
          { value: "31-100人", label: "31-100 人" },
          { value: "100人以上", label: "100 人以上" },
        ],
      },
      {
        id: "a10",
        label: "目前月營收範圍",
        type: "select",
        helpText: "此資料僅供評估參考，不會對外公開",
        options: [
          { value: "尚無營收", label: "尚無營收" },
          { value: "10萬以下", label: "10 萬以下" },
          { value: "10-50萬", label: "10-50 萬" },
          { value: "50-100萬", label: "50-100 萬" },
          { value: "100-500萬", label: "100-500 萬" },
          { value: "500萬以上", label: "500 萬以上" },
          { value: "不方便透露", label: "不方便透露" },
        ],
      },
    ],
  },
  {
    id: "marketing",
    title: "行銷現況",
    subtitle: "了解你目前的行銷狀態",
    icon: "📣",
    questions: [
      {
        id: "b1",
        label: "目前有在投放數位廣告嗎？",
        type: "radio",
        required: true,
        options: [
          { value: "有，自己操作", label: "有，自己操作" },
          { value: "有，委託代操", label: "有，委託廣告代操公司" },
          { value: "曾經有，現在沒有", label: "曾經有，現在暫停了" },
          { value: "從來沒有", label: "從來沒有投過廣告" },
        ],
      },
      {
        id: "b2",
        label: "目前使用哪些廣告平台？",
        type: "checkbox",
        options: [
          { value: "Facebook/IG 廣告", label: "Facebook / Instagram 廣告" },
          { value: "Google 搜尋廣告", label: "Google 搜尋廣告" },
          { value: "Google 多媒體廣告", label: "Google 多媒體 / YouTube 廣告" },
          { value: "LINE 廣告", label: "LINE LAP 廣告" },
          { value: "其他平台", label: "其他平台" },
          { value: "沒有使用", label: "目前沒有使用" },
        ],
        helpText: "可複選",
      },
      {
        id: "b3",
        label: "每月廣告預算大約多少？",
        type: "select",
        options: [
          { value: "沒有預算", label: "目前沒有廣告預算" },
          { value: "1萬以下", label: "1 萬以下" },
          { value: "1-3萬", label: "1-3 萬" },
          { value: "3-5萬", label: "3-5 萬" },
          { value: "5-10萬", label: "5-10 萬" },
          { value: "10-30萬", label: "10-30 萬" },
          { value: "30萬以上", label: "30 萬以上" },
        ],
      },
      {
        id: "b4",
        label: "目前行銷上最大的困擾是什麼？",
        type: "checkbox",
        options: [
          { value: "不知道怎麼開始", label: "不知道怎麼開始做行銷" },
          { value: "廣告花錢沒效果", label: "廣告花了錢但看不到效果" },
          { value: "沒時間經營社群", label: "沒時間經營社群" },
          { value: "不知道目標客群", label: "不確定目標客群在哪裡" },
          { value: "品牌定位模糊", label: "品牌定位不夠清晰" },
          { value: "競爭對手太多", label: "市場競爭激烈、不知如何突圍" },
          { value: "轉換率低", label: "有流量但轉換率低" },
          { value: "其他", label: "其他" },
        ],
        helpText: "可複選，選出最有感的困擾",
      },
    ],
  },
  {
    id: "brand",
    title: "品牌認知",
    subtitle: "深入了解你的品牌定位",
    icon: "🎯",
    questions: [
      {
        id: "c1",
        label: "你覺得品牌的核心優勢是什麼？",
        type: "textarea",
        placeholder: "你的品牌跟競爭對手比起來，最大的不同或優勢是什麼？",
        required: true,
      },
      {
        id: "c2",
        label: "主要的目標客群是誰？",
        type: "textarea",
        placeholder: "例如：25-45歲女性、注重健康的上班族、想去印度朝聖的佛教徒",
        required: true,
      },
      {
        id: "c3",
        label: "你的主要競爭對手有哪些？",
        type: "textarea",
        placeholder: "列出 2-3 個你認為的主要競爭品牌",
      },
      {
        id: "c4",
        label: "客戶選擇你而不選競品的原因通常是？",
        type: "textarea",
        placeholder: "例如：價格更優惠、服務更專業、品質更好、口碑好...",
      },
    ],
  },
  {
    id: "goals",
    title: "目標期望",
    subtitle: "告訴我們你想達成什麼",
    icon: "🚀",
    questions: [
      {
        id: "d1",
        label: "最希望透過行銷達成的目標",
        type: "checkbox",
        required: true,
        options: [
          { value: "提升品牌知名度", label: "提升品牌知名度" },
          { value: "增加網站流量", label: "增加網站/店面流量" },
          { value: "提高營收", label: "直接提高營收/銷售" },
          { value: "獲取潛在客戶", label: "獲取潛在客戶名單" },
          { value: "建立品牌形象", label: "建立/重塑品牌形象" },
          { value: "社群粉絲成長", label: "社群粉絲數成長" },
          { value: "提高回購率", label: "提高老客戶回購率" },
        ],
        helpText: "可複選，選出最重要的 2-3 項",
      },
      {
        id: "d2",
        label: "最感興趣的服務項目",
        type: "checkbox",
        options: [
          { value: "品牌定位策略", label: "品牌定位策略" },
          { value: "廣告投放優化", label: "廣告投放優化" },
          { value: "社群經營管理", label: "社群經營管理" },
          { value: "內容行銷", label: "內容行銷" },
          { value: "不確定，需要建議", label: "不確定，希望你們建議" },
        ],
        helpText: "可複選",
      },
      {
        id: "d3",
        label: "預計的行銷預算範圍（月）",
        type: "select",
        options: [
          { value: "還沒有預算概念", label: "還沒有預算概念" },
          { value: "3萬以下", label: "3 萬以下" },
          { value: "3-5萬", label: "3-5 萬" },
          { value: "5-10萬", label: "5-10 萬" },
          { value: "10-20萬", label: "10-20 萬" },
          { value: "20萬以上", label: "20 萬以上" },
        ],
      },
      {
        id: "d4",
        label: "還有什麼想補充的嗎？",
        type: "textarea",
        placeholder: "任何你覺得我們應該知道的事情，或是你對這次諮詢的期待",
      },
    ],
  },
  {
    id: "contact",
    title: "聯絡資訊",
    subtitle: "讓我們能回覆你的分析結果",
    icon: "📞",
    questions: [
      {
        id: "a7",
        label: "聯絡人姓名",
        type: "text",
        placeholder: "你的姓名",
        required: true,
      },
      {
        id: "a8",
        label: "聯絡方式",
        type: "text",
        placeholder: "手機號碼或 Email（擇一即可）",
        required: true,
        helpText: "我們會在 2 個工作天內透過此方式聯絡你",
      },
    ],
  },
];

// ===== 答案類型 =====
export interface QuestionnaireAnswers {
  [key: string]: string | string[];
}
