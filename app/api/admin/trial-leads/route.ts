import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trialLeads } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { desc } from "drizzle-orm";

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const leads = await db
    .select()
    .from(trialLeads)
    .orderBy(desc(trialLeads.createdAt))
    .limit(200);

  return NextResponse.json({ leads, total: leads.length });
}
