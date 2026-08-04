import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientFeedback } from "@/lib/db/schema";
import { feedbackAccessCompany, notifyFeedback } from "@/lib/client-feedback";
import { pagesForCompany } from "@/lib/feedback-clients";

const CATEGORIES = ["bug", "需求", "操作問題"];

interface SubmitBody {
  reporter?: string;
  page?: string;
  category?: string;
  description?: string;
  expected?: string;
  files?: Array<{ path: string; name: string; type: string; size: number }>;
}

// 提交回饋：檔案已由客戶端直傳完成，這裡只收 metadata＋通知。
export async function POST(request: NextRequest) {
  const company = await feedbackAccessCompany();
  if (!company) return NextResponse.json({ error: "請先輸入通行碼" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as SubmitBody | null;
  if (!body) return NextResponse.json({ error: "格式錯誤" }, { status: 400 });

  const reporter = body.reporter?.trim() ?? "";
  const page = body.page?.trim() ?? "";
  const category = body.category?.trim() ?? "";
  const description = body.description?.trim() ?? "";
  if (!reporter || reporter.length > 100) return NextResponse.json({ error: "請填寫反應人姓名" }, { status: 400 });
  if (!pagesForCompany(company).includes(page)) return NextResponse.json({ error: "請選擇系統頁面" }, { status: 400 });
  if (!CATEGORIES.includes(category)) return NextResponse.json({ error: "請選擇問題類別" }, { status: 400 });
  if (!description || description.length > 5000) return NextResponse.json({ error: "請填寫問題描述（上限 5000 字）" }, { status: 400 });

  const files = (body.files ?? [])
    .filter((f) => f && typeof f.path === "string" && /^\d{8}\/[0-9a-f-]{36}\.[a-z0-9]+$/.test(f.path))
    .slice(0, 10)
    .map((f) => ({ path: f.path, name: String(f.name).slice(0, 200), type: String(f.type), size: Number(f.size) || 0 }));

  const [row] = await db
    .insert(clientFeedback)
    .values({
      company,
      reporter,
      page,
      category,
      description,
      expected: body.expected?.trim().slice(0, 2000) || null,
      files,
    })
    .returning({ id: clientFeedback.id });

  await notifyFeedback({
    id: row!.id,
    company,
    reporter,
    page,
    category,
    description,
    fileCount: files.length,
  });

  return NextResponse.json({ ok: true, id: row!.id });
}
