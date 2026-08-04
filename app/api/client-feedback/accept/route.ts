import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { clientFeedback } from "@/lib/db/schema";
import { feedbackAccessCompany } from "@/lib/client-feedback";

// 客戶驗收（2026-08-04）：僅該公司自己的「已上線待驗收」項目可按通過 → 結案。
export async function POST(request: NextRequest) {
  const company = await feedbackAccessCompany();
  if (!company) return NextResponse.json({ error: "請先輸入通行碼" }, { status: 401 });

  const { id } = (await request.json().catch(() => ({}))) as { id?: string };
  if (!id) return NextResponse.json({ error: "缺少項目編號" }, { status: 400 });

  const [row] = await db
    .update(clientFeedback)
    .set({ status: "closed", acceptedAt: new Date() })
    .where(and(eq(clientFeedback.id, id), eq(clientFeedback.company, company), eq(clientFeedback.status, "acceptance")))
    .returning({ id: clientFeedback.id, fbNo: clientFeedback.fbNo, description: clientFeedback.description });
  if (!row) return NextResponse.json({ error: "此項目不在待驗收狀態" }, { status: 400 });

  // 通知（失敗不擋結案）
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "惠邦行銷 <hello@huibang.com.tw>",
      to: process.env.NOTIFY_EMAIL || "service@huibang.com.tw",
      subject: `✅ 客戶驗收通過：${company}｜${row.fbNo ?? row.id.slice(0, 8)}`,
      html: `<p>${company} 已驗收通過：</p><p><b>${row.fbNo ?? ""}</b> ${row.description.slice(0, 200)}</p><p>項目已自動結案，請同步更新 FEEDBACK-LOG。</p>`,
    });
  } catch (e) {
    console.error("accept notify failed", e);
  }

  return NextResponse.json({ ok: true });
}
