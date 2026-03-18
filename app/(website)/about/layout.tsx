import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "關於惠邦行銷 | 高雄數位行銷公司・成立於 2020",
  description:
    "惠邦行銷創立於 2020 年，是深耕高雄的數位行銷公司，服務旅遊、電商、餐飲、教育四大產業，以數據驅動品牌成長，已協助 50+ 品牌實現精準行銷。",
  openGraph: {
    title: "關於惠邦行銷 | 高雄數位行銷公司・成立於 2020",
    description:
      "深耕高雄的數位行銷公司，服務旅遊、電商、餐飲、教育產業，已協助 50+ 品牌實現精準行銷。",
    url: "https://huibang.com.tw/about",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
