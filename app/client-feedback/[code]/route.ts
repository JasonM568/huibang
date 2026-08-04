import { NextRequest, NextResponse } from "next/server";
import { FEEDBACK_COOKIE, accessCodeMap, issueFeedbackCookie } from "@/lib/client-feedback";

// 純路徑直達連結（2026-08-04）：/client-feedback/<通行碼>
// 帶 query 的連結在通訊軟體常被截斷（曾造成 404），路徑版怎麼貼都完整。
// 碼有效→設 cookie 導表單；無效→導表單顯示通行碼閘門。
export async function GET(_request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const company = accessCodeMap().get(decodeURIComponent(code).trim());
  const res = NextResponse.redirect(new URL("/client-feedback", process.env.NEXT_PUBLIC_BASE_URL || "https://huibang.com.tw"));
  if (company) {
    res.cookies.set(FEEDBACK_COOKIE, await issueFeedbackCookie(company), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 3600,
      path: "/",
    });
  }
  return res;
}
