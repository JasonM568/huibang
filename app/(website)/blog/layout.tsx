import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "行銷知識庫",
  description:
    "惠邦行銷分享品牌策略、數位行銷、AI 應用等實用知識，幫助企業主掌握最新行銷趨勢。免費閱讀專業行銷文章。",
  openGraph: {
    title: "行銷知識庫 | 惠邦行銷",
    description: "品牌策略、數位行銷、AI 應用等實用知識，幫助企業主掌握最新行銷趨勢。",
    url: "https://huibang.com.tw/blog",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
