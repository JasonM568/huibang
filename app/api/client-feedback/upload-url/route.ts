import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  ALLOWED_UPLOAD_TYPES,
  IMAGE_MAX_SIZE,
  VIDEO_MAX_SIZE,
  createUploadUrl,
  ensureFeedbackBucket,
  hasFeedbackAccess,
  isVideoType,
} from "@/lib/client-feedback";

// 產生檔案直傳連結：客戶端拿到 signed URL 後直接 PUT 到 Supabase Storage，
// 大影片不經 Vercel function（繞過 request body 限制）。
export async function POST(request: NextRequest) {
  if (!(await hasFeedbackAccess())) return NextResponse.json({ error: "請先輸入通行碼" }, { status: 401 });

  const { fileName, contentType, size } = (await request.json().catch(() => ({}))) as {
    fileName?: string;
    contentType?: string;
    size?: number;
  };
  if (!fileName || !contentType || !size) return NextResponse.json({ error: "缺少檔案資訊" }, { status: 400 });

  const ext = ALLOWED_UPLOAD_TYPES[contentType];
  if (!ext) return NextResponse.json({ error: "僅支援 jpg/png/webp 圖片與 mp4/mov/webm 影片" }, { status: 400 });
  const max = isVideoType(contentType) ? VIDEO_MAX_SIZE : IMAGE_MAX_SIZE;
  if (size > max) {
    return NextResponse.json(
      { error: isVideoType(contentType) ? "影片大小超過 50MB，請以 1080p 以下畫質錄製或壓縮後上傳" : "圖片大小超過 10MB" },
      { status: 400 },
    );
  }

  try {
    await ensureFeedbackBucket();
    const today = new Date().toISOString().slice(0, 10).replaceAll("-", "");
    const path = `${today}/${randomUUID()}.${ext}`;
    const uploadUrl = await createUploadUrl(path);
    return NextResponse.json({ uploadUrl, path });
  } catch (e) {
    console.error("upload-url failed", e);
    return NextResponse.json({ error: "產生上傳連結失敗，請稍後再試" }, { status: 500 });
  }
}
