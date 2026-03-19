import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { edmLogs } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { desc } from "drizzle-orm";

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const logs = await db.select().from(edmLogs).orderBy(desc(edmLogs.createdAt)).limit(50);
  return NextResponse.json({ logs });
}
