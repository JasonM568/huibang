import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "關於我們",
  description:
    "惠邦行銷是一間專注數位行銷的台灣本土公司，以品牌策略為核心，幫助企業找到對的受眾。認識我們的理念、服務精神與團隊。",
  openGraph: {
    title: "關於我們 | 惠邦行銷",
    description: "惠邦行銷以品牌策略為核心，幫助企業找到對的受眾。認識我們的理念與團隊。",
    url: "https://huibang.com.tw/about",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
