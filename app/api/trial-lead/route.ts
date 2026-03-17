import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trialLeads } from "@/lib/db/schema";
import { notifyTrialLead } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone } = await request.json();

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "姓名和 Email 為必填" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email 格式不正確" }, { status: 400 });
    }

    await db.insert(trialLeads).values({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      source: "restaurant-pack",
      agentDelivered: true,
    });

    // 非同步發送 Email 通知，不阻擋回應
    notifyTrialLead({ name: name.trim(), email: email.trim(), phone: phone?.trim() }).catch(() => {});

    const agentUrl = process.env.TRIAL_AGENT_URL || null;

    return NextResponse.json({ success: true, agentUrl });
  } catch (error) {
    console.error("[trial-lead] error:", error);
    return NextResponse.json({ error: "系統錯誤，請稍後再試" }, { status: 500 });
  }
}
