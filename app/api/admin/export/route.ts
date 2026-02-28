import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function POST() {
  try {
    await requireAuth();

    const data = await db
      .select()
      .from(submissions)
      .orderBy(desc(submissions.createdAt));

    // Build CSV
    const headers = [
      "ID",
      "提交時間",
      "品牌名稱",
      "產業",
      "聯絡人",
      "聯絡方式",
      "團隊規模",
      "年營業額",
      "狀態",
      "總分",
      "負責人",
    ];

    const rows = data.map((s) => {
      const analysis = s.analysis as { overall_score?: number } | null;
      return [
        s.id,
        s.createdAt?.toISOString().slice(0, 19).replace("T", " "),
        s.brandName || "",
        s.industry || "",
        s.contactName || "",
        s.contactInfo || "",
        s.teamSize || "",
        s.revenueRange || "",
        s.status,
        analysis?.overall_score || "",
        s.assignedTo || "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
    });

    const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="questionnaire_export_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
