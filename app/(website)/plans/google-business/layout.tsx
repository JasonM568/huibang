import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Google 我的商家導流方案 | 在地搜尋排名優化・高雄",
  description:
    "惠邦行銷提供 Google 我的商家優化 + Google Ads 精準投放服務，原價 NT$26,800，本月限時特價 NT$18,800（含 $6,000 廣告費），3 個月一期，協助餐飲與在地店家提升 Google 地圖排名。免費 AI 商家健檢。",
  keywords:
    "Google我的商家,Google商家優化,Google Ads,在地搜尋,地圖排名,餐飲行銷,高雄,惠邦行銷",
  openGraph: {
    title: "Google 我的商家導流方案 | 惠邦行銷",
    description:
      "Google 商家優化 + Ads 精準投放，月費 NT$18,800，讓附近的客人都能找到你。",
    url: "https://huibang.com.tw/plans/google-business",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Google 我的商家導流方案合約期間是多久？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "最低合作期間為三個月。三個月後可選擇續約或調整。Google 商家優化需要持續經營，通常 3 個月開始看到明顯成效。",
      },
    },
    {
      "@type": "Question",
      name: "廣告費包含在方案費用裡嗎？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "不包含。方案費用為策略規劃與執行管理費，Google Ads 廣告費由你直接支付給 Google，建議每月 NT$9,000-15,000。",
      },
    },
    {
      "@type": "Question",
      name: "不是餐飲業也可以使用嗎？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "可以！我們的服務適用於所有需要提升 Google 地圖排名的在地店家，包括美容美髮、診所、健身房、零售門市等。",
      },
    },
    {
      "@type": "Question",
      name: "多久可以看到效果？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "商家檔案優化通常 2-4 週開始反映在搜尋排名，廣告效果 1-2 週即可看到初步數據，3 個月後整體效果最為顯著。",
      },
    },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Google 我的商家導流方案",
  description:
    "Google 我的商家優化 + Google Ads 精準投放，協助在地店家提升搜尋排名與來客數。",
  provider: {
    "@type": "Organization",
    name: "惠邦行銷",
    url: "https://huibang.com.tw",
  },
  areaServed: { "@type": "Country", name: "TW" },
  offers: {
    "@type": "Offer",
    price: "18800",
    priceCurrency: "TWD",
    eligibleDuration: { "@type": "QuantitativeValue", value: 3, unitCode: "MON" },
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      {children}
    </>
  );
}
