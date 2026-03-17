import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 社群帳號深度健診",
  description:
    "AI 深度分析你的 Instagram / Facebook 帳號，找出成長盲點、提供具體改善建議。一次性報告，NT$999 即可掌握社群帳號的完整健康狀態。",
  openGraph: {
    title: "AI 社群帳號深度健診 | 惠邦行銷",
    description: "AI 深度分析社群帳號，找出成長盲點、提供具體改善建議。NT$999 一次性報告。",
    url: "https://huibang.com.tw/plans/social-audit",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
