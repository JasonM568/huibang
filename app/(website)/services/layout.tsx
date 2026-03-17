import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "服務項目",
  description:
    "惠邦行銷提供品牌健檢、廣告投放、社群經營、內容行銷、AI 行銷等完整數位行銷服務。了解如何協助你的品牌在數位時代成長。",
  openGraph: {
    title: "服務項目 | 惠邦行銷",
    description: "品牌健檢、廣告投放、社群經營、內容行銷、AI 行銷，一站式數位行銷解決方案。",
    url: "https://huibang.com.tw/services",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
