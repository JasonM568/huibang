import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 個體包 — 餐飲老闆的 AI 行銷軍團",
  description:
    "惠邦 AI 個體包，10 位專為餐飲老闆設計的 AI 助理，社群文案免費試用，全配方案 NT$1,299，折扣碼再折 $300，ChatGPT 操作零門檻，餐廳行銷全面升級。",
  keywords:
    "餐飲行銷,AI助理,ChatGPT,餐廳行銷,社群貼文,AI個體包,惠邦行銷,餐飲AI行銷工具,GPT餐飲",
  openGraph: {
    title: "AI 個體包 — 餐飲老闆的 AI 行銷軍團 | 惠邦行銷",
    description:
      "10 位 AI 專家全面支援餐飲事業，社群文案免費試用，全配方案 NT$1,299 起。",
    url: "https://huibang.com.tw/ai/restaurant-pack",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "什麼是「AI 個體包」？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AI 個體包是 9 個專為餐飲業老闆設計的客製化 GPTs（AI 助理）。每個 GPT 都針對餐飲經營的特定場景優化，不需要學任何技術，直接用中文跟 AI 對話就能完成工作。",
      },
    },
    {
      "@type": "Question",
      name: "我不會用 ChatGPT，能用嗎？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "完全沒問題！每個 GPT 都已經預設好指令和情境，你只要像跟員工講話一樣，告訴它你的需求就好。我們也會提供使用教學，讓你快速上手。",
      },
    },
    {
      "@type": "Question",
      name: "購買後可以用多久？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "購買後即可永久使用這 9 個 GPTs，不限次數。只要你有 ChatGPT 帳號（免費版即可使用部分功能，Plus 版體驗最佳），就能隨時使用。",
      },
    },
    {
      "@type": "Question",
      name: "免費試用的「社群文案機器人」和付費方案的差別？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "社群文案機器人專門負責每日社群貼文，免費提供體驗。付費的全配方案另外包含 9 位 AI 專家，涵蓋活動企劃、評論回覆、成本計算、廣告投放、人資招募等餐飲經營的各個面向。",
      },
    },
    {
      "@type": "Question",
      name: "有折扣嗎？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "有！先免費試用社群文案機器人，Email 會收到 $300 折扣碼，結帳時輸入即可折抵，原價 $1,299 折後只要 $999！",
      },
    },
    {
      "@type": "Question",
      name: "跟直接用 ChatGPT 有什麼不同？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "直接用 ChatGPT 你需要自己想 prompt、給背景資料、調整語氣。我們的客製化 GPTs 已經內建餐飲業的專業知識、台灣在地用語和最佳實踐，打開就能直接用，省去大量摸索時間。",
      },
    },
  ],
};

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "AI 個體包 — 餐飲業客製化 GPTs",
  description:
    "10 位專為餐飲老闆設計的 AI 助理，涵蓋社群文案、活動企劃、評論回覆、成本計算、廣告投放等。",
  brand: { "@type": "Brand", name: "惠邦行銷" },
  offers: {
    "@type": "Offer",
    price: "1299",
    priceCurrency: "TWD",
    availability: "https://schema.org/InStock",
    url: "https://huibang.com.tw/ai/restaurant-pack",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {children}
    </>
  );
}
