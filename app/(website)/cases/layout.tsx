import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "成功案例 | 旅遊、電商、餐飲、教育產業行銷成果",
  description:
    "查看惠邦行銷的真實客戶案例：ROAS 5.2 倍、來客數 +60%、報名成長 180%，了解我們如何協助旅遊、電商、餐飲、教育產業提升數位行銷成效。",
  openGraph: {
    title: "成功案例 | 惠邦行銷・旅遊、電商、餐飲、教育產業行銷成果",
    description:
      "真實客戶案例：ROAS 5.2 倍、來客數 +60%、報名成長 180%，跨產業行銷成效實證。",
    url: "https://huibang.com.tw/cases",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
