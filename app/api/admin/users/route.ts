import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import bcrypt from "bcryptjs";

// 檢查是否為 admin
async function requireAdmin() {
  const session = await requireAuth();
  if (session.role !== "admin") {
    throw new Error("Forbidden");
  }
  return session;
}

// GET: 列出所有人員
export async function GET() {
  try {
    await requireAdmin();

    const users = await db
      .select({
        id: adminUsers.id,
        email: adminUsers.email,
        name: adminUsers.name,
        role: adminUsers.role,
        canQuote: adminUsers.canQuote,
        canSalary: adminUsers.canSalary,
        createdAt: adminUsers.createdAt,
      })
      .from(adminUsers)
      .orderBy(desc(adminUsers.createdAt));

    return NextResponse.json(users);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "需要管理員權限" }, { status: 403 });
    }
    console.error("List users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: 新增人員
export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { email, password, name, role } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email 和密碼為必填" }, { status: 400 });
    }

    if (role && !["admin", "editor"].includes(role)) {
      return NextResponse.json({ error: "無效的角色" }, { status: 400 });
    }

    // 檢查 email 是否已存在
    const existing = await db
      .select({ id: adminUsers.id })
      .from(adminUsers)
      .where(eq(adminUsers.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "此 Email 已存在" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [user] = await db
      .insert(adminUsers)
      .values({
        email,
        passwordHash,
        name: name || email.split("@")[0],
        role: role || "editor",
      })
      .returning({
        id: adminUsers.id,
        email: adminUsers.email,
        name: adminUsers.name,
        role: adminUsers.role,
        createdAt: adminUsers.createdAt,
      });

    return NextResponse.json(user);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "需要管理員權限" }, { status: 403 });
    }
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH: 更新人員（角色、名稱、密碼）
export async function PATCH(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { id, name, role, password, canQuote } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    if (role && !["admin", "editor"].includes(role)) {
      return NextResponse.json({ error: "無效的角色" }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (role) updates.role = role;
    if (canQuote !== undefined) updates.canQuote = canQuote;
    if (body.canSalary !== undefined) updates.canSalary = body.canSalary;
    if (password) updates.passwordHash = await bcrypt.hash(password, 10);

    const [updated] = await db
      .update(adminUsers)
      .set(updates)
      .where(eq(adminUsers.id, id))
      .returning({
        id: adminUsers.id,
        email: adminUsers.email,
        name: adminUsers.name,
        role: adminUsers.role,
        createdAt: adminUsers.createdAt,
      });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "需要管理員權限" }, { status: 403 });
    }
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: 刪除人員
export async function DELETE(request: Request) {
  try {
    const session = await requireAdmin();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // 不能刪除自己
    if (id === session.userId) {
      return NextResponse.json({ error: "不能刪除自己的帳號" }, { status: 400 });
    }

    await db.delete(adminUsers).where(eq(adminUsers.id, id));

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "需要管理員權限" }, { status: 403 });
    }
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
