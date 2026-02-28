import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { submissions, emailLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { analyzeBrand } from "@/lib/analyze";
import { notifyTeam, notifyCustomer } from "@/lib/email";

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
        socialMedia: Array.isArray(answers.a6) ? answers.a6.join(", ") : answers.a6 || null,
        contactName: answers.a7 || null,
        contactInfo: answers.a23 || answers.a8 || null,
        teamSize: answers.a9 || null,
        revenueRange: answers.a10 || null,
        answers: answers,
        status: "pending",
      })
      .returning();

    // 2. AI 分析
    const analyzePromise = analyzeBrand(
      answers,
      answers.a1 || "未提供",
      answers.a2 || "未提供"
    ).then(async (analysis) => {
      await db
        .update(submissions)
        .set({ analysis, status: "analyzed" })
        .where(eq(submissions.id, submission.id));

      // 3. 分析完成後寄訪客確認信
      if (answers.a23) {
        const score = (analysis as { overall_score?: number })?.overall_score || 0;
        await notifyCustomer({
          email: answers.a23,
          contactName: answers.a7 || "你好",
          brandName: answers.a1 || "你的品牌",
          submissionId: submission.id,
          overallScore: score,
        }).then(async () => {
          await db.insert(emailLogs).values({
            submissionId: submission.id,
            emailType: "customer_report",
            recipient: answers.a23,
            status: "sent",
          });
        }).catch((err) => {
          console.error("Customer email failed:", err);
        });
      }
    }).catch((err) => {
      console.error("Analysis failed:", err);
    });

    // 4. 團隊通知信（不等待）
    const emailPromise = notifyTeam({
      brandName: answers.a1 || "未提供",
      industry: answers.a2 || "未提供",
      contactName: answers.a7 || "未提供",
      contactInfo: answers.a23 || answers.a8 || "未提供",
      submissionId: submission.id,
    }).then(async () => {
      await db.insert(emailLogs).values({
        submissionId: submission.id,
        emailType: "team_notify",
        recipient: process.env.NOTIFY_EMAIL || "team@huibang.com",
        status: "sent",
      });
    }).catch((err) => {
      console.error("Team email failed:", err);
    });

    // 等待分析完成（含訪客寄信）
    await analyzePromise;
    // 團隊通知不等待
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
