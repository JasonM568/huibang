import { NextRequest, NextResponse } from "next/server";
import { FEEDBACK_COOKIE, accessCodeMap, issueFeedbackCookie } from "@/lib/client-feedback";

// 通行碼驗證：正確則發 30 天 cookie。簡單節流：同 IP 連續錯誤由前端延遲提示即可（碼外洩再換）。
export async function POST(request: NextRequest) {
  const { code } = (await request.json().catch(() => ({}))) as { code?: string };
  const map = accessCodeMap();
  if (map.size === 0) return NextResponse.json({ error: "表單尚未啟用（未設定通行碼）" }, { status: 503 });
  const company = code ? map.get(code.trim()) : undefined;
  if (!company) {
    return NextResponse.json({ error: "通行碼錯誤" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true, company });
  res.cookies.set(FEEDBACK_COOKIE, await issueFeedbackCookie(company), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 30 * 24 * 3600,
    path: "/",
  });
  return res;
}
