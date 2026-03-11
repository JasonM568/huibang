import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { eq, like } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

// GET: 取得所有追蹤碼設定（需登入）
export async function GET() {
  try {
    await requireAuth();

    const settings = await db
      .select()
      .from(siteSettings)
      .where(like(siteSettings.key, "tracking_%"));

    const result: Record<string, string> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Tracking settings GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH: 更新追蹤碼設定（僅 admin）
export async function PATCH(request: Request) {
  try {
    const session = await requireAuth();
    if (session.role !== "admin") {
      return NextResponse.json({ error: "需要管理員權限" }, { status: 403 });
    }

    const body = await request.json();

    const allowedKeys = [
      "tracking_gtm",
      "tracking_ga4",
      "tracking_google_ads",
      "tracking_meta_pixel",
      "tracking_line_tag",
    ];

    // 驗證值格式（防止 XSS）
    const safePattern = /^[a-zA-Z0-9_-]*$/;

    for (const [key, value] of Object.entries(body)) {
      if (!allowedKeys.includes(key)) continue;
      const strValue = String(value);
      if (!safePattern.test(strValue)) {
        return NextResponse.json(
          { error: `${key} 格式不正確，僅允許英數字、底線和連字號` },
          { status: 400 }
        );
      }
      await db
        .update(siteSettings)
        .set({ value: strValue, updatedAt: new Date() })
        .where(eq(siteSettings.key, key));
    }

    // 回傳更新後的值
    const settings = await db
      .select()
      .from(siteSettings)
      .where(like(siteSettings.key, "tracking_%"));

    const result: Record<string, string> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Tracking settings PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
