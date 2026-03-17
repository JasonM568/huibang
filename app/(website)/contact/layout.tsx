import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "聯絡我們",
  description:
    "有任何行銷問題或合作需求，歡迎聯絡惠邦行銷。提供免費品牌諮詢，讓你的品牌找到對的方向。",
  openGraph: {
    title: "聯絡我們 | 惠邦行銷",
    description: "有任何行銷問題或合作需求，歡迎聯絡惠邦行銷。提供免費品牌諮詢。",
    url: "https://huibang.com.tw/contact",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
