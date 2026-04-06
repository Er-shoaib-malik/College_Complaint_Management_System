import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUser } from "@/middleware/auth";
import dbConnect from "@/lib/dbConnect";
import Complaint from "@/models/Complaint";
import StatCard from "@/components/ui/StatCard";
import ComplaintCard from "@/components/complaints/ComplaintCard";

export default async function StudentDashboard() {
  const authUser = await getAuthUser();
  if (!authUser || authUser.role !== "student") redirect("/login");

  await dbConnect();

  const [total, pending, inProgress, resolved] = await Promise.all([
    Complaint.countDocuments({ createdBy: authUser.id }),
    Complaint.countDocuments({ createdBy: authUser.id, status: "pending" }),
    Complaint.countDocuments({ createdBy: authUser.id, status: { $in: ["assigned", "in_progress"] } }),
    Complaint.countDocuments({ createdBy: authUser.id, status: "resolved" }),
  ]);

  const recentComplaints = await Complaint.find({ createdBy: authUser.id })
    .populate("category", "name")
    .populate("assignedTo", "name")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const safeComplaints = JSON.parse(JSON.stringify(recentComplaints));

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-500 mt-1">Track and manage your complaints</p>
        </div>
        <Link href="/complaints/new" className="btn-primary">
          + New Complaint
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total" value={total} color="blue" icon="📋" />
        <StatCard label="Pending" value={pending} color="yellow" icon="⏳" />
        <StatCard label="In Progress" value={inProgress} color="purple" icon="🔄" />
        <StatCard label="Resolved" value={resolved} color="green" icon="✅" />
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-900">Recent Complaints</h2>
          <Link href="/complaints/new" className="text-sm text-blue-600 hover:underline">
            View all →
          </Link>
        </div>
        {safeComplaints.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-500 mb-4">No complaints submitted yet</p>
            <Link href="/complaints/new" className="btn-primary">Submit your first complaint</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {safeComplaints.map((c) => (
              <ComplaintCard key={c._id} complaint={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
