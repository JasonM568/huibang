import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 個體包 — 餐飲老闆的 AI 行銷軍團",
  description:
    "一次擁有 10 位專為餐飲業設計的 AI 專家：社群貼文、負評回覆、成本計算、廣告投放、人資招募，全面支援你的餐飲事業。先免費試用社群文案機器人，滿意再升級全配包，限時優惠 NT$999。",
  keywords: "餐飲行銷,AI助理,ChatGPT,餐廳行銷,社群貼文,AI個體包,惠邦行銷",
  openGraph: {
    title: "AI 個體包 — 餐飲老闆的 AI 行銷軍團 | 惠邦行銷",
    description: "10 位 AI 專家全面支援餐飲事業，先免費試用，滿意再以 NT$999 升級全配包。",
    url: "https://huibang.com.tw/ai/restaurant-pack",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
