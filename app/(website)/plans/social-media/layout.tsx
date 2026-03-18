import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "社群媒體代操方案 | FB・IG・Threads 三平台・高雄",
  description:
    "惠邦行銷提供 FB、IG、Threads 三平台社群代操服務，NT$18,000 起，每月 12–36 篇專業貼文，含文案設計與數據月報，高雄在地服務，免費諮詢。",
  openGraph: {
    title: "社群媒體代操方案 | FB・IG・Threads | 惠邦行銷",
    description:
      "三平台社群代操 NT$18,000 起，每月 12–36 篇專業貼文，含數據月報，高雄在地服務。",
    url: "https://huibang.com.tw/plans/social-media",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
