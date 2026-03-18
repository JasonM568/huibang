import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "服務項目 | 高雄品牌定位・廣告代操・社群經營・內容行銷",
  description:
    "惠邦行銷提供品牌定位策略、Facebook/Google 廣告代操、社群經營管理、內容行銷與 AI 行銷工具，高雄在地服務，協助中小企業數位轉型。",
  openGraph: {
    title: "服務項目 | 高雄品牌定位・廣告代操・社群經營 | 惠邦行銷",
    description:
      "品牌定位、廣告代操、社群經營、內容行銷，高雄在地一站式數位行銷解決方案。",
    url: "https://huibang.com.tw/services",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
