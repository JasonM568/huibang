import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminUsers, loginLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const [user] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 更新最後登入時間 + 寫入登入紀錄
    const now = new Date();
    await db.update(adminUsers).set({ lastLoginAt: now }).where(eq(adminUsers.id, user.id));
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";
    const userAgent = request.headers.get("user-agent") || "";
    await db.insert(loginLogs).values({
      userId: user.id,
      loginAt: now,
      ip: ip.slice(0, 50),
      userAgent: userAgent.slice(0, 300),
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      canQuote: user.canQuote,
      canSalary: user.canSalary,
    });

    const response = NextResponse.json({ success: true, name: user.name });
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
