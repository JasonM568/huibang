"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { clientFeedback } from "@/lib/db/schema";

const STATUSES = ["new", "logged", "waiting_client", "acceptance", "closed"];

/** 更新回饋處理狀態/回覆/FB 編號（客戶處理進度頁即時可見）。 */
export async function updateFeedbackAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const reply = String(formData.get("reply") ?? "").trim();
  const fbNo = String(formData.get("fbNo") ?? "").trim();
  if (!id || !STATUSES.includes(status)) throw new Error("輸入格式錯誤");

  await db
    .update(clientFeedback)
    .set({ status, reply: reply || null, fbNo: fbNo || null })
    .where(eq(clientFeedback.id, id));

  revalidatePath("/admin/client-feedback");
  revalidatePath("/client-feedback");
}
