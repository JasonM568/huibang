import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { diagnosticTokens } from "@/lib/db/schema";
import { like } from "drizzle-orm";

/**
 * GET /api/ecpay/check-order?trade_no=HBxxxxxxxx
 * 前端輪詢：查詢付款後 token 是否已建立
 * callback 會把 tradeNo 存在 note 欄位（格式：「ECPay 自動：HBxxxxxxxx」）
 */
export async function GET(request: NextRequest) {
  const tradeNo = request.nextUrl.searchParams.get("trade_no");

  if (!tradeNo) {
    return NextResponse.json({ ready: false, reason: "missing_trade_no" });
  }

  try {
    const [record] = await db
      .select()
      .from(diagnosticTokens)
      .where(like(diagnosticTokens.note, `%${tradeNo}%`))
      .limit(1);

    if (!record) {
      return NextResponse.json({ ready: false });
    }

    return NextResponse.json({
      ready: true,
      token: record.token,
    });
  } catch (error) {
    console.error("Check order error:", error);
    return NextResponse.json({ ready: false, reason: "error" });
  }
}
