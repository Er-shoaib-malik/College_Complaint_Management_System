"use client";
import { useState, useEffect } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    setLoading(true);
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.categories || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const url = editId ? `/api/categories/${editId}` : "/api/categories";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setForm({ name: "", description: "" });
    setEditId(null);
    fetchCategories();
  }

  async function deleteCategory(id) {
    if (!confirm("Deactivate this category?")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    fetchCategories();
  }

  function startEdit(cat) {
    setEditId(cat._id);
    setForm({ name: cat.name, description: cat.description || "" });
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
        <p className="text-gray-500 mt-1">Manage complaint categories</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">{editId ? "Edit Category" : "Add New Category"}</h2>
          {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded mb-3 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Infrastructure, Academic" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." />
            </div>
            <div className="flex gap-3">
              <button className="btn-primary" type="submit">{editId ? "Update" : "Create"} Category</button>
              {editId && (
                <button className="btn-secondary" type="button" onClick={() => { setEditId(null); setForm({ name: "", description: "" }); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Existing Categories</h2>
          {loading ? (
            <p className="text-gray-500 text-center py-4">Loading...</p>
          ) : categories.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No categories yet. Add one!</p>
          ) : (
            <div className="space-y-3">
              {categories.map((c) => (
                <div key={c._id} className="flex items-start justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{c.name}</p>
                    {c.description && <p className="text-sm text-gray-500 mt-0.5">{c.description}</p>}
                  </div>
                  <div className="flex gap-2 ml-3 shrink-0">
                    <button onClick={() => startEdit(c)} className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                    <button onClick={() => deleteCategory(c._id)} className="text-xs text-red-600 hover:underline font-medium">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
