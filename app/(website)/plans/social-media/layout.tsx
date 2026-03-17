import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "社群媒體經營方案",
  description:
    "惠邦行銷提供 Instagram、Facebook、Line 三平台社群經營服務，包含內容策略、貼文製作、廣告投放、數據分析，讓品牌每天都在線。",
  openGraph: {
    title: "社群媒體經營方案 | 惠邦行銷",
    description: "IG、FB、LINE 三平台社群經營，內容策略、貼文製作、廣告投放一次搞定。",
    url: "https://huibang.com.tw/plans/social-media",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
