import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trialLeads } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source");

  let query = db
    .select()
    .from(trialLeads)
    .orderBy(desc(trialLeads.createdAt))
    .limit(200);

  if (source) {
    query = query.where(eq(trialLeads.source, source)) as typeof query;
  }

  const leads = await query;

  return NextResponse.json({ leads, total: leads.length });
}
