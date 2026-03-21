import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trialLeads } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notifyTrialLead, sendTrialAgentEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone } = await request.json();

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "姓名和 Email 為必填" }, { status: 400 });
    }

    // 姓名驗證：防止無效資料
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return NextResponse.json({ error: "請填寫完整姓名（至少 2 個字）" }, { status: 400 });
    }
    if (/^[a-zA-Z]{1,4}$/.test(trimmedName)) {
      return NextResponse.json({ error: "請填寫真實姓名" }, { status: 400 });
    }
    if (/@/.test(trimmedName)) {
      return NextResponse.json({ error: "姓名欄位請勿填寫 Email" }, { status: 400 });
    }
    if (/^[\d\s\-+()]+$/.test(trimmedName)) {
      return NextResponse.json({ error: "姓名欄位請勿填寫電話號碼" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email 格式不正確" }, { status: 400 });
    }

    const [lead] = await db.insert(trialLeads).values({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      source: "restaurant-pack",
      agentDelivered: false,
    }).returning({ id: trialLeads.id });

    // 寄試用連結給用戶（await 確保 Vercel 不會提前終止）
    try {
      await sendTrialAgentEmail({ email: email.trim(), name: name.trim() });
      await db.update(trialLeads).set({ agentDelivered: true, deliveredAt: new Date() }).where(eq(trialLeads.id, lead.id));
    } catch (err) {
      console.error("[trial-lead] sendTrialAgentEmail failed:", email, err);
    }

    // 通知團隊（非關鍵，不阻擋回應）
    notifyTrialLead({ name: name.trim(), email: email.trim(), phone: phone?.trim() }).catch((err) => {
      console.error("[trial-lead] notifyTrialLead failed:", err);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[trial-lead] error:", error);
    return NextResponse.json({ error: "系統錯誤，請稍後再試" }, { status: 500 });
  }
}
