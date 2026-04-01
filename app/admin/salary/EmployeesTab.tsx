"use client";

import { useEffect, useState } from "react";

interface Employee {
  id: string;
  name: string;
  department: string | null;
  jobTitle: string | null;
  jobGrade: string | null;
  baseSalary: string;
  isActive: boolean;
}

export default function EmployeesTab() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", department: "", jobTitle: "", jobGrade: "", baseSalary: "" });

  const fetchEmployees = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/employees?all=1");
    const data = await res.json();
    setEmployees(data.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchEmployees(); }, []);

  const resetForm = () => { setForm({ name: "", department: "", jobTitle: "", jobGrade: "", baseSalary: "" }); setEditingId(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await fetch(`/api/admin/employees/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    } else {
      await fetch("/api/admin/employees", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    resetForm();
    fetchEmployees();
  };

  const handleEdit = (e: Employee) => {
    setForm({ name: e.name, department: e.department || "", jobTitle: e.jobTitle || "", jobGrade: e.jobGrade || "", baseSalary: e.baseSalary });
    setEditingId(e.id);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">+ 新增員工</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold mb-4">{editingId ? "編輯員工" : "新增員工"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">單位</label>
                  <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">職位</label>
                  <input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">職等</label>
                  <input value={form.jobGrade} onChange={(e) => setForm({ ...form, jobGrade: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">基本薪資</label>
                  <input type="number" value={form.baseSalary} onChange={(e) => setForm({ ...form, baseSalary: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">{editingId ? "儲存" : "新增"}</button>
                <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">取消</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">載入中...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">姓名</th>
                <th className="px-4 py-3 font-medium">單位</th>
                <th className="px-4 py-3 font-medium">職位</th>
                <th className="px-4 py-3 font-medium">職等</th>
                <th className="px-4 py-3 font-medium text-right">基本薪資</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{e.name}</td>
                  <td className="px-4 py-3 text-gray-600">{e.department || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{e.jobTitle || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{e.jobGrade || "-"}</td>
                  <td className="px-4 py-3 text-gray-900 text-right">${Number(e.baseSalary).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleEdit(e)} className="text-blue-600 hover:text-blue-800 mr-3">編輯</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
