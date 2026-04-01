"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  canQuote: boolean;
  canSalary: boolean;
  createdAt: string;
}

const roleMap: Record<string, { label: string; color: string }> = {
  admin: { label: "管理員", color: "bg-purple-100 text-purple-700" },
  editor: { label: "編輯", color: "bg-blue-100 text-blue-700" },
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);

  // 新增表單
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "", role: "editor" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // 編輯
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", role: "", password: "" });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.status === 403) {
        setForbidden(true);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "新增失敗");
        return;
      }
      setUsers([data, ...users]);
      setShowForm(false);
      setForm({ email: "", password: "", name: "", role: "editor" });
    } catch (err) {
      setFormError("新增失敗");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    setSaving(true);
    try {
      const body: Record<string, string> = { id };
      if (editForm.name) body.name = editForm.name;
      if (editForm.role) body.role = editForm.role;
      if (editForm.password) body.password = editForm.password;

      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.map((u) => (u.id === id ? data : u)));
        setEditingId(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`確定要刪除 ${email} 嗎？此操作無法復原。`)) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "刪除失敗");
        return;
      }
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (forbidden) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">🔒</p>
        <h2 className="text-xl font-bold text-gray-900 mb-2">權限不足</h2>
        <p className="text-gray-500">只有管理員可以管理人員</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">人員管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理後台登入帳號與權限</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {showForm ? "取消" : "+ 新增人員"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">新增人員</h2>
          <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">密碼 *</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="至少 6 位"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">名稱</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="顯示名稱"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">角色</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="editor">編輯（可檢視和更新狀態）</option>
                <option value="admin">管理員（可管理人員）</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "新增中..." : "新增人員"}
              </button>
              {formError && (
                <span className="text-sm text-red-500">{formError}</span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Users list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">名稱</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">角色</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">報價系統</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">薪資管理</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">建立時間</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const role = roleMap[user.role] || { label: user.role, color: "bg-gray-100 text-gray-700" };
                  const isEditing = editingId === user.id;

                  return (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="px-2 py-1 border border-gray-300 rounded text-sm w-full"
                          />
                        ) : (
                          <span className="font-medium text-gray-900">{user.name || "—"}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{user.email}</td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <select
                            value={editForm.role}
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="editor">編輯</option>
                            <option value="admin">管理員</option>
                          </select>
                        ) : (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${role.color}`}>
                            {role.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            const newVal = !user.canQuote;
                            setUsers(users.map((u) => (u.id === user.id ? { ...u, canQuote: newVal } : u)));
                            fetch("/api/admin/users", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: user.id, canQuote: newVal }),
                            });
                          }}
                          className={`inline-block w-10 h-5 rounded-full transition-colors relative ${
                            user.canQuote ? "bg-blue-600" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                              user.canQuote ? "translate-x-5" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            const newVal = !user.canSalary;
                            setUsers(users.map((u) => (u.id === user.id ? { ...u, canSalary: newVal } : u)));
                            fetch("/api/admin/users", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: user.id, canSalary: newVal }),
                            });
                          }}
                          className={`inline-block w-10 h-5 rounded-full transition-colors relative ${
                            user.canSalary ? "bg-blue-600" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                              user.canSalary ? "translate-x-5" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString("zh-TW")}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="password"
                              placeholder="新密碼（不改留空）"
                              value={editForm.password}
                              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                              className="px-2 py-1 border border-gray-300 rounded text-xs w-32"
                            />
                            <button
                              onClick={() => handleUpdate(user.id)}
                              disabled={saving}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              儲存
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-gray-400 hover:text-gray-600 text-sm"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                setEditingId(user.id);
                                setEditForm({
                                  name: user.name || "",
                                  role: user.role,
                                  password: "",
                                });
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              編輯
                            </button>
                            <button
                              onClick={() => handleDelete(user.id, user.email)}
                              className="text-red-400 hover:text-red-600 text-sm"
                            >
                              刪除
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Permission explanation */}
      <div className="mt-6 bg-gray-50 rounded-xl p-5 text-sm text-gray-500">
        <h3 className="font-medium text-gray-700 mb-2">權限說明</h3>
        <div className="space-y-1">
          <p><span className="font-medium text-purple-600">管理員</span> — 可檢視所有資料、更新狀態、管理人員帳號、報價系統</p>
          <p><span className="font-medium text-blue-600">編輯</span> — 可檢視所有資料、更新狀態，不能管理人員</p>
          <p><span className="font-medium text-green-600">報價系統</span> — 開啟後該人員可使用報價系統功能</p>
          <p><span className="font-medium text-green-600">薪資管理</span> — 開啟後該人員可使用薪資管理功能</p>
        </div>
      </div>
    </div>
  );
}
