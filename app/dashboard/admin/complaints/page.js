"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => { fetchComplaints(); }, [statusFilter, page]);

  async function fetchComplaints() {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/complaints?${params}`);
    const data = await res.json();
    setComplaints(data.complaints || []);
    setPagination(data.pagination || {});
    setLoading(false);
  }

  const statuses = ["", "pending", "assigned", "in_progress", "resolved", "closed"];
  const statusLabels = { "": "All", pending: "Pending", assigned: "Assigned", in_progress: "In Progress", resolved: "Resolved", closed: "Closed" };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">All Complaints</h1>
        <p className="text-gray-500 mt-1">Manage and assign all complaints</p>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-2 mb-5">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              {statusLabels[s]}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-8">Loading...</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">Title</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Student</th>
                    <th className="pb-3 font-medium">Assigned To</th>
                    <th className="pb-3 font-medium">Priority</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c._id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-medium max-w-xs truncate">{c.title}</td>
                      <td className="py-3 text-gray-600">{c.category?.name || "—"}</td>
                      <td className="py-3 text-gray-600">{c.createdBy?.name || "—"}</td>
                      <td className="py-3 text-gray-600">{c.assignedTo?.name || <span className="text-gray-400">Unassigned</span>}</td>
                      <td className="py-3 capitalize text-gray-600">{c.priority}</td>
                      <td className="py-3"><StatusBadge status={c.status} /></td>
                      <td className="py-3 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="py-3">
                        <Link href={`/complaints/${c._id}`} className="text-blue-600 hover:underline font-medium text-xs">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {complaints.length === 0 && <p className="text-center text-gray-500 py-8">No complaints found</p>}
            </div>

            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm disabled:opacity-40">
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {pagination.pages}</span>
                <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="btn-secondary text-sm disabled:opacity-40">
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
