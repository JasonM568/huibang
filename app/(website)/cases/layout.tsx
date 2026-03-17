import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "客戶案例",
  description:
    "查看惠邦行銷的真實客戶案例與成效，了解我們如何協助餐飲、零售、服務業等不同產業的品牌提升數位行銷成效。",
  openGraph: {
    title: "客戶案例 | 惠邦行銷",
    description: "真實客戶案例與成效，了解惠邦行銷如何協助不同產業品牌提升數位行銷成效。",
    url: "https://huibang.com.tw/cases",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
