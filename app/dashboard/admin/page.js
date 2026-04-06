import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUser } from "@/middleware/auth";
import dbConnect from "@/lib/dbConnect";
import Complaint from "@/models/Complaint";
import User from "@/models/User";
import StatCard from "@/components/ui/StatCard";
import ComplaintCard from "@/components/complaints/ComplaintCard";

export default async function AdminDashboard() {
  const authUser = await getAuthUser();
  if (!authUser || authUser.role !== "admin") redirect("/login");

  await dbConnect();

  const [totalComplaints, pending, inProgress, resolved, totalUsers, totalStaff] = await Promise.all([
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: "pending" }),
    Complaint.countDocuments({ status: { $in: ["assigned", "in_progress"] } }),
    Complaint.countDocuments({ status: "resolved" }),
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "staff" }),
  ]);

  const recentComplaints = await Complaint.find()
    .populate("category", "name")
    .populate("createdBy", "name email rollNo")
    .populate("assignedTo", "name")
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  const safeComplaints = JSON.parse(JSON.stringify(recentComplaints));

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">System overview and management</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/admin/users" className="btn-secondary">Manage Users</Link>
          <Link href="/dashboard/admin/categories" className="btn-primary">Categories</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="Total Complaints" value={totalComplaints} color="blue" icon="📋" />
        <StatCard label="Pending" value={pending} color="yellow" icon="⏳" />
        <StatCard label="In Progress" value={inProgress} color="purple" icon="🔄" />
        <StatCard label="Resolved" value={resolved} color="green" icon="✅" />
        <StatCard label="Students" value={totalUsers} color="blue" icon="🎓" />
        <StatCard label="Staff" value={totalStaff} color="gray" icon="👥" />
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-900">All Recent Complaints</h2>
          <Link href="/dashboard/admin/complaints" className="text-sm text-blue-600 hover:underline">
            View all →
          </Link>
        </div>
        {safeComplaints.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No complaints yet</p>
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
