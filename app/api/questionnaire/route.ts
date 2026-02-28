import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { submissions, emailLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { analyzeBrand } from "@/lib/analyze";
import { notifyTeam } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { answers } = body;

    if (!answers) {
      return NextResponse.json(
        { error: "Missing answers" },
        { status: 400 }
      );
    }

    // 1. 寫入資料庫
    const [submission] = await db
      .insert(submissions)
      .values({
        brandName: answers.a1 || null,
        industry: answers.a2 || null,
        foundedYear: answers.a3 || null,
        mainProducts: answers.a4 || null,
        website: answers.a5 || null,
        socialMedia: answers.a6 || null,
        contactName: answers.a7 || null,
        contactInfo: answers.a8 || null,
        teamSize: answers.a9 || null,
        revenueRange: answers.a10 || null,
        answers: answers,
        status: "pending",
      })
      .returning();

    // 2. 非同步觸發 AI 分析（不阻塞回應）
    const analyzePromise = analyzeBrand(
      answers,
      answers.a1 || "未提供",
      answers.a2 || "未提供"
    ).then(async (analysis) => {
      await db
        .update(submissions)
        .set({ analysis, status: "analyzed" })
        .where(eq(submissions.id, submission.id));
    }).catch((err) => {
      console.error("Analysis failed:", err);
    });

    // 3. 非同步發送 Email 通知
    const emailPromise = notifyTeam({
      brandName: answers.a1 || "未提供",
      industry: answers.a2 || "未提供",
      contactName: answers.a7 || "未提供",
      contactInfo: answers.a8 || "未提供",
      submissionId: submission.id,
    }).then(async () => {
      await db.insert(emailLogs).values({
        submissionId: submission.id,
        emailType: "team_notify",
        recipient: process.env.NOTIFY_EMAIL || "team@huibang.com",
        status: "sent",
      });
    }).catch((err) => {
      console.error("Email failed:", err);
    });

    // 等待分析完成（讓客戶可以馬上看到結果）
    await analyzePromise;
    // Email 不等待
    void emailPromise;

    return NextResponse.json({
      success: true,
      id: submission.id,
    });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
