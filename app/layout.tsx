import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "惠邦行銷 | 讓每個品牌都找到對的人",
  description:
    "惠邦行銷提供品牌定位、廣告投放、社群經營、內容行銷等數位行銷服務，協助企業打造強勢品牌。",
  keywords: "品牌定位,數位行銷,廣告投放,社群經營,惠邦行銷",
  openGraph: {
    title: "惠邦行銷 | 讓每個品牌都找到對的人",
    description: "專業數位行銷服務，協助企業打造強勢品牌",
    type: "website",
    locale: "zh_TW",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
