import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trialLeads } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { sendTrialAgentEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "缺少 id" }, { status: 400 });

  const [lead] = await db.select().from(trialLeads).where(eq(trialLeads.id, id)).limit(1);
  if (!lead) return NextResponse.json({ error: "找不到名單" }, { status: 404 });

  try {
    await sendTrialAgentEmail({ email: lead.email, name: lead.name });
    await db.update(trialLeads)
      .set({ agentDelivered: true, deliveredAt: new Date() })
      .where(eq(trialLeads.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[resend trial] failed:", err);
    return NextResponse.json({ error: "寄送失敗" }, { status: 500 });
  }
}
