import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUser } from "@/middleware/auth";
import dbConnect from "@/lib/dbConnect";
import Complaint from "@/models/Complaint";
import StatCard from "@/components/ui/StatCard";
import ComplaintCard from "@/components/complaints/ComplaintCard";

export default async function StaffDashboard() {
  const authUser = await getAuthUser();
  if (!authUser || authUser.role !== "staff") redirect("/login");

  await dbConnect();

  const [assigned, inProgress, resolved] = await Promise.all([
    Complaint.countDocuments({ assignedTo: authUser.id, status: "assigned" }),
    Complaint.countDocuments({ assignedTo: authUser.id, status: "in_progress" }),
    Complaint.countDocuments({ assignedTo: authUser.id, status: "resolved" }),
  ]);

  const myComplaints = await Complaint.find({
    assignedTo: authUser.id,
    status: { $in: ["assigned", "in_progress"] },
  })
    .populate("category", "name")
    .populate("createdBy", "name email rollNo")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const safeComplaints = JSON.parse(JSON.stringify(myComplaints));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your assigned complaints</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Assigned" value={assigned} color="blue" icon="📥" />
        <StatCard label="In Progress" value={inProgress} color="purple" icon="🔄" />
        <StatCard label="Resolved" value={resolved} color="green" icon="✅" />
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Active Complaints</h2>
        {safeComplaints.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🎉</p>
            <p className="text-gray-500">No active complaints assigned to you</p>
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
