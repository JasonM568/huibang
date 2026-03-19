import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { edmLogs } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { sendEdm } from "@/lib/email";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const { subject, bodyHtml, ctaText, ctaUrl, recipients } = await request.json();

  if (!subject?.trim()) return NextResponse.json({ error: "請填寫主旨" }, { status: 400 });
  if (!bodyHtml?.trim()) return NextResponse.json({ error: "請填寫內文" }, { status: 400 });
  if (!recipients?.length) return NextResponse.json({ error: "請選擇收件人" }, { status: 400 });

  const results = { success: 0, failed: 0 };

  for (const r of recipients as { email: string; name: string }[]) {
    try {
      await sendEdm({ to: r.email, name: r.name, subject, bodyHtml, ctaText, ctaUrl });
      results.success++;
    } catch {
      results.failed++;
    }
  }

  await db.insert(edmLogs).values({
    subject,
    recipientCount: results.success,
    recipients: recipients,
    sentBy: (auth as { email?: string }).email || "admin",
    status: results.failed === 0 ? "sent" : results.failed === recipients.length ? "failed" : "partial",
  });

  return NextResponse.json({ ...results, total: recipients.length });
}
