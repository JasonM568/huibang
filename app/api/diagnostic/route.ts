import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { diagnosticTokens, diagnosticSubmissions, emailLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { analyzeDeepDiagnostic } from "@/lib/analyze-deep";
import { notifyDiagnosticCustomer, notifyTeamDiagnostic } from "@/lib/email";

// POST /api/diagnostic — 提交深度問卷
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { answers, token } = body;

    if (!answers || !token) {
      return NextResponse.json(
        { error: "Missing answers or token" },
        { status: 400 }
      );
    }

    // 1. 驗證 token
    const [tokenRecord] = await db
      .select()
      .from(diagnosticTokens)
      .where(eq(diagnosticTokens.token, token))
      .limit(1);

    if (!tokenRecord) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    if (tokenRecord.status === "used") {
      return NextResponse.json({ error: "Token already used" }, { status: 401 });
    }
    if (tokenRecord.status === "expired" || tokenRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }

    // 2. 寫入 DB（pending）
    const [submission] = await db
      .insert(diagnosticSubmissions)
      .values({
        tokenId: tokenRecord.id,
        email: tokenRecord.email,
        contactName: tokenRecord.contactName,
        answers,
        status: "pending",
      })
      .returning();

    // 3. 標記 token 為已使用
    await db
      .update(diagnosticTokens)
      .set({ status: "used", usedAt: new Date(), submissionId: submission.id })
      .where(eq(diagnosticTokens.id, tokenRecord.id));

    // 4. AI 分析（非同步）
    const analyzePromise = analyzeDeepDiagnostic(answers).then(async (analysis) => {
      await db
        .update(diagnosticSubmissions)
        .set({ analysis, status: "analyzed" })
        .where(eq(diagnosticSubmissions.id, submission.id));

      // 5. 寄送報告 Email 給客戶
      if (tokenRecord.email) {
        await notifyDiagnosticCustomer({
          email: tokenRecord.email,
          contactName: tokenRecord.contactName || "你好",
          submissionId: submission.id,
          overallScore: analysis.overall_score,
          healthLevel: analysis.health_level,
        }).catch((err) => console.error("Diagnostic customer email failed:", err));
      }
    }).catch((err) => {
      console.error("Deep analysis failed:", err);
    });

    // 6. 通知團隊（不等待）
    const teamNotifyPromise = notifyTeamDiagnostic({
      contactName: tokenRecord.contactName || "未提供",
      email: tokenRecord.email,
      submissionId: submission.id,
    }).catch((err) => console.error("Team diagnostic notify failed:", err));

    await analyzePromise;
    void teamNotifyPromise;

    return NextResponse.json({ success: true, id: submission.id });
  } catch (error) {
    console.error("Diagnostic submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
