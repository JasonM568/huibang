import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await requireAuth();

    // 從資料庫即時查權限，不依賴 JWT token
    const [user] = await db
      .select({
        id: adminUsers.id,
        email: adminUsers.email,
        role: adminUsers.role,
        canQuote: adminUsers.canQuote,
        canSalary: adminUsers.canSalary,
      })
      .from(adminUsers)
      .where(eq(adminUsers.id, session.userId));

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      role: user.role,
      canQuote: user.canQuote,
      canSalary: user.canSalary,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
