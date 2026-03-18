import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "行銷知識庫 | 品牌策略・廣告投放・AI 行銷實戰教學",
  description:
    "惠邦行銷分享品牌策略、Facebook 廣告投放、社群經營、AI 行銷等實戰知識，幫助高雄中小企業主掌握最新數位行銷趨勢，免費閱讀。",
  openGraph: {
    title: "行銷知識庫 | 惠邦行銷",
    description:
      "品牌策略、廣告投放、AI 行銷實戰教學，幫助企業主掌握最新數位行銷趨勢。",
    url: "https://huibang.com.tw/blog",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
