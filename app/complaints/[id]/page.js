"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [complaint, setComplaint] = useState(null);
  const [user, setUser] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateForm, setUpdateForm] = useState({ status: "", assignedTo: "", remark: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchComplaint();
    fetchCurrentUser();
  }, [id]);

  async function fetchCurrentUser() {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      if (data.user.role === "admin") {
        const sRes = await fetch("/api/users?role=staff");
        const sData = await sRes.json();
        setStaff(sData.users || []);
      }
    }
  }

  async function fetchComplaint() {
    setLoading(true);
    const res = await fetch(`/api/complaints/${id}`);
    if (res.ok) {
      const data = await res.json();
      setComplaint(data.complaint);
      setUpdateForm((f) => ({ ...f, status: data.complaint.status, assignedTo: data.complaint.assignedTo?._id || "" }));
    }
    setLoading(false);
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(`/api/complaints/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateForm),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setSaving(false); return; }
    setComplaint(data.complaint);
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this complaint? This cannot be undone.")) return;
    const res = await fetch(`/api/complaints/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/dashboard/student");
  }

  const statusOptions = {
    admin: { pending: ["assigned"], assigned: ["in_progress", "pending"], in_progress: ["resolved", "closed"], resolved: ["closed"], closed: [] },
    staff: { assigned: ["in_progress"], in_progress: ["resolved"], pending: [], resolved: [], closed: [] },
    student: { pending: [], assigned: [], in_progress: [], resolved: [], closed: [] },
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading complaint...</div>;
  if (!complaint) return <div className="text-center py-20 text-gray-500">Complaint not found</div>;

  const nextStatuses = user ? (statusOptions[user.role]?.[complaint.status] || []) : [];
  const canUpdate = user && (user.role === "admin" || user.role === "staff");
  const canDelete = user && (user.role === "admin" || (user.role === "student" && complaint.status === "pending"));

  const priorityColors = { low: "text-gray-500", medium: "text-yellow-600", high: "text-red-600" };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
      </div>

      <div className="card mb-6">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{complaint.title}</h1>
            <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-500">
              <span className="bg-gray-100 px-2 py-0.5 rounded-full">{complaint.category?.name}</span>
              <span className={`font-medium capitalize ${priorityColors[complaint.priority]}`}>{complaint.priority} priority</span>
              <span>Submitted {new Date(complaint.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <StatusBadge status={complaint.status} />
        </div>

        <p className="text-gray-700 leading-relaxed mb-4">{complaint.description}</p>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
          <div>
            <p className="text-gray-500 mb-1">Submitted by</p>
            <p className="font-medium">{complaint.createdBy?.name}</p>
            <p className="text-gray-500 text-xs">{complaint.createdBy?.email}</p>
            {complaint.createdBy?.rollNo && <p className="text-gray-500 text-xs">{complaint.createdBy.rollNo}</p>}
          </div>
          <div>
            <p className="text-gray-500 mb-1">Assigned to</p>
            <p className="font-medium">{complaint.assignedTo?.name || "Not assigned yet"}</p>
            {complaint.assignedTo && <p className="text-gray-500 text-xs">{complaint.assignedTo.email}</p>}
          </div>
        </div>

        {complaint.remarks && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs font-medium text-blue-700 mb-1">Staff Remarks</p>
            <p className="text-sm text-blue-900">{complaint.remarks}</p>
          </div>
        )}

        {canDelete && (
          <div className="mt-4 flex justify-end">
            <button onClick={handleDelete} className="btn-danger text-sm">Delete Complaint</button>
          </div>
        )}
      </div>

      {canUpdate && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-4">Update Complaint</h2>
          {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded mb-3 text-sm">{error}</div>}
          <form onSubmit={handleUpdate} className="space-y-4">
            {nextStatuses.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                <select className="input" value={updateForm.status} onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}>
                  <option value={complaint.status}>{complaint.status.replace("_", " ")} (current)</option>
                  {nextStatuses.map((s) => (
                    <option key={s} value={s}>{s.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
            )}

            {user.role === "admin" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Staff</label>
                <select className="input" value={updateForm.assignedTo} onChange={(e) => setUpdateForm({ ...updateForm, assignedTo: e.target.value })}>
                  <option value="">— Unassigned —</option>
                  {staff.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.department || "No dept"})</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks / Notes</label>
              <textarea className="input" rows={3} value={updateForm.remark} onChange={(e) => setUpdateForm({ ...updateForm, remark: e.target.value })} placeholder="Add a note or update..." />
            </div>

            <button className="btn-primary" type="submit" disabled={saving}>{saving ? "Saving..." : "Save Update"}</button>
          </form>
        </div>
      )}

      {/* Status Timeline */}
      <div className="card">
        <h2 className="font-semibold mb-4">Status History</h2>
        <div className="space-y-4">
          {complaint.statusHistory?.map((h, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mt-1 shrink-0" />
                {i < complaint.statusHistory.length - 1 && <div className="w-0.5 bg-gray-200 flex-1 mt-1" />}
              </div>
              <div className="pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm capitalize">{h.status.replace("_", " ")}</span>
                  {h.changedBy && <span className="text-xs text-gray-500">by {h.changedBy.name || "System"}</span>}
                </div>
                {h.remark && <p className="text-sm text-gray-600 mt-0.5">{h.remark}</p>}
                <p className="text-xs text-gray-400 mt-1">{new Date(h.changedAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
