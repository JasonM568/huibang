import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { clientFeedback, clientFeedbackComments } from "@/lib/db/schema";
import { feedbackAccessCompany } from "@/lib/client-feedback";

interface CommentBody {
  feedbackId?: string;
  authorName?: string;
  body?: string;
  files?: Array<{ path: string; name: string; type: string; size: number }>;
}

// 客戶對單一項目留言/提供資料（2026-08-04）：僅能對自己公司的未結案項目留言。
export async function POST(request: NextRequest) {
  const company = await feedbackAccessCompany();
  if (!company) return NextResponse.json({ error: "請先輸入通行碼" }, { status: 401 });

  const payload = (await request.json().catch(() => null)) as CommentBody | null;
  if (!payload?.feedbackId) return NextResponse.json({ error: "缺少項目編號" }, { status: 400 });
  const body = payload.body?.trim() ?? "";
  if (!body || body.length > 3000) return NextResponse.json({ error: "請填寫留言內容（上限 3000 字）" }, { status: 400 });

  const [item] = await db
    .select({ id: clientFeedback.id, fbNo: clientFeedback.fbNo, status: clientFeedback.status, description: clientFeedback.description })
    .from(clientFeedback)
    .where(and(eq(clientFeedback.id, payload.feedbackId), eq(clientFeedback.company, company)));
  if (!item) return NextResponse.json({ error: "項目不存在" }, { status: 404 });
  if (item.status === "closed") return NextResponse.json({ error: "已結案項目無法留言，請另開新回饋" }, { status: 400 });

  const files = (payload.files ?? [])
    .filter((f) => f && typeof f.path === "string" && /^\d{8}\/[0-9a-f-]{36}\.[a-z0-9]+$/.test(f.path))
    .slice(0, 10)
    .map((f) => ({ path: f.path, name: String(f.name).slice(0, 200), type: String(f.type), size: Number(f.size) || 0 }));

  await db.insert(clientFeedbackComments).values({
    feedbackId: item.id,
    author: "client",
    authorName: payload.authorName?.trim().slice(0, 100) || null,
    body,
    files,
  });

  // 通知（失敗不擋留言）
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || "https://huibang.com.tw";
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "惠邦行銷 <hello@huibang.com.tw>",
      to: process.env.NOTIFY_EMAIL || "service@huibang.com.tw",
      subject: `📎 客戶提供資料/留言：${company}｜${item.fbNo ?? ""}`,
      html: `<p><b>${company}</b> 於項目 <b>${item.fbNo ?? item.id.slice(0, 8)}</b>（${item.description.slice(0, 80)}…）留言：</p>
        <p style="white-space:pre-wrap;background:#F8FAFC;padding:12px;border-radius:8px;">${body}</p>
        <p>附件 ${files.length} 件</p><a href="${base}/admin/client-feedback">後台檢視</a>`,
    });
  } catch (e) {
    console.error("comment notify failed", e);
  }

  return NextResponse.json({ ok: true });
}
