import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { companyInfo } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireRestrictedAccess } from "@/lib/auth";

export async function GET() {
  try {
    await requireRestrictedAccess();

    const [info] = await db
      .select()
      .from(companyInfo)
      .where(eq(companyInfo.id, "default"));

    if (!info) {
      // Create default record
      const [created] = await db
        .insert(companyInfo)
        .values({ id: "default" })
        .returning();
      return NextResponse.json(created);
    }

    return NextResponse.json(info);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireRestrictedAccess();
    const body = await request.json();

    const [existing] = await db
      .select()
      .from(companyInfo)
      .where(eq(companyInfo.id, "default"));

    if (!existing) {
      const [created] = await db
        .insert(companyInfo)
        .values({ id: "default", ...body })
        .returning();
      return NextResponse.json(created);
    }

    const [updated] = await db
      .update(companyInfo)
      .set(body)
      .where(eq(companyInfo.id, "default"))
      .returning();

    return NextResponse.json(updated);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
