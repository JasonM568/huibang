import { NextRequest, NextResponse } from "next/server";
import { FEEDBACK_COOKIE, issueFeedbackCookie } from "@/lib/client-feedback";

// 通行碼驗證：正確則發 30 天 cookie。簡單節流：同 IP 連續錯誤由前端延遲提示即可（碼外洩再換）。
export async function POST(request: NextRequest) {
  const { code } = (await request.json().catch(() => ({}))) as { code?: string };
  const expected = process.env.FEEDBACK_ACCESS_CODE;
  if (!expected) return NextResponse.json({ error: "表單尚未啟用（未設定通行碼）" }, { status: 503 });
  if (!code || code.trim() !== expected) {
    return NextResponse.json({ error: "通行碼錯誤" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(FEEDBACK_COOKIE, await issueFeedbackCookie(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 30 * 24 * 3600,
    path: "/",
  });
  return res;
}
