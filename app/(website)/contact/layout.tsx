import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "聯絡我們 | 高雄惠邦行銷・免費品牌諮詢",
  description:
    "歡迎聯絡惠邦行銷，高雄市三民區九如一路 61 號 5F-2，電話 07-2810889，提供免費品牌諮詢與行銷策略規劃，讓你的品牌找到對的方向。",
  openGraph: {
    title: "聯絡我們 | 高雄惠邦行銷・免費品牌諮詢",
    description:
      "高雄市三民區，電話 07-2810889，免費品牌諮詢與行銷策略規劃。",
    url: "https://huibang.com.tw/contact",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://huibang.com.tw/#business",
  name: "惠邦行銷",
  alternateName: "惠邦創意整合行銷有限公司",
  description:
    "高雄在地數位行銷公司，提供品牌定位、廣告投放、社群經營、內容行銷服務。",
  url: "https://huibang.com.tw",
  telephone: "+886-7-2810889",
  email: "service@huibang.com.tw",
  address: {
    "@type": "PostalAddress",
    streetAddress: "九如一路 61 號 5F-2",
    addressLocality: "三民區",
    addressRegion: "高雄市",
    postalCode: "807",
    addressCountry: "TW",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 22.6396,
    longitude: 120.3026,
  },
  image: "https://huibang.com.tw/og-default.png",
  priceRange: "$$",
  areaServed: {
    "@type": "City",
    name: "高雄市",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      {children}
    </>
  );
}
