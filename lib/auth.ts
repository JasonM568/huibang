import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-change-me");

export async function signToken(payload: { userId: string; email: string; role: string; canQuote?: boolean; canSalary?: boolean }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: string; email: string; role: string; canQuote?: boolean; canSalary?: boolean };
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

// 受限模組權限（客戶管理、報價系統、薪資管理）：僅限特定 email
const RESTRICTED_EMAILS = ["acc@huibang.com.tw", "chief@huibang.com.tw"];

export async function requireRestrictedAccess() {
  const session = await requireAuth();
  if (!RESTRICTED_EMAILS.includes(session.email)) {
    throw new Error("Forbidden");
  }
  return session;
}

// 向下相容
export const requireClientAccess = requireRestrictedAccess;
