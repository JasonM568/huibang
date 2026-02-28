import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactSubmissions } from "@/lib/db/schema";
import { notifyTeam } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, company, email, phone, service, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "缺少必填欄位" }, { status: 400 });
    }

    const [submission] = await db
      .insert(contactSubmissions)
      .values({ name, company, email, phone, service, message })
      .returning();

    // 非同步通知團隊
    notifyTeam({
      brandName: company || "（聯絡表單）",
      industry: service || "未選擇",
      contactName: name,
      contactInfo: email,
      submissionId: submission.id,
    }).catch((err) => console.error("Contact notify failed:", err));

    return NextResponse.json({ success: true, id: submission.id });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
