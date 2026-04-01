"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface Session {
  userId: string;
  email: string;
  role: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Skip auth check on login page
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return;

    fetch("/api/admin/me")
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && !data.error) setSession(data);
      })
      .catch(() => {
        router.push("/admin/login");
      });
  }, [isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const isAdmin = session?.role === "admin";

  const navItems = [
    { href: "/admin/dashboard", label: "儀表板", icon: "📊", show: true },
    { href: "/admin/submissions", label: "問卷列表", icon: "📋", show: true },
    { href: "/admin/contacts", label: "聯絡表單", icon: "💬", show: true },
    { href: "/admin/clients", label: "客戶管理", icon: "🏢", show: true },
    { href: "/admin/content-studio", label: "貼文產生器", icon: "✨", show: true },
    { href: "/admin/quote-system", label: "報價系統", icon: "📄", show: true },
    { href: "/admin/users", label: "人員管理", icon: "👥", show: isAdmin },
    { href: "/admin/tracking", label: "追蹤碼管理", icon: "📈", show: true },
    { href: "/admin/diagnostic", label: "深度健診", icon: "🔬", show: true },
    { href: "/admin/orders", label: "訂單管理", icon: "🧾", show: true },
    { href: "/admin/trial-leads", label: "試用名單", icon: "🎁", show: true },
    { href: "/admin/edm", label: "電子報 EDM", icon: "📨", show: isAdmin },
  ].filter((item) => item.show);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-600 hover:text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-bold text-gray-900">惠邦後台</span>
        <div className="w-6" />
      </div>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-200 z-50 transform transition-transform duration-200 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-5 border-b border-gray-100 shrink-0">
          <Link href="/admin/submissions" className="text-lg font-bold text-blue-600">
            惠邦行銷
          </Link>
          <p className="text-xs text-gray-400 mt-0.5">管理後台</p>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto flex-1 min-h-0">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith(item.href)
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="shrink-0 p-3 border-t border-gray-100">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm text-gray-500">{session?.email?.split("@")[0] || "管理員"}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              登出
            </button>
          </div>
          <Link
            href="/"
            className="block text-center text-xs text-gray-400 hover:text-blue-500 mt-1"
          >
            ← 回官網
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-60 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
