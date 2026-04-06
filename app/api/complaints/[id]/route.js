import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Complaint from "@/models/Complaint";
import Notification from "@/models/Notification";
import { getAuthUser } from "@/middleware/auth";

export async function GET(request, { params }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const complaint = await Complaint.findById(params.id)
      .populate("category", "name description")
      .populate("createdBy", "name email rollNo department")
      .populate("assignedTo", "name email department")
      .populate("statusHistory.changedBy", "name role");

    if (!complaint) return NextResponse.json({ error: "Complaint not found" }, { status: 404 });

    // Students can only see their own complaints
    if (authUser.role === "student" && complaint.createdBy._id.toString() !== authUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ complaint });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const body = await request.json();
    const complaint = await Complaint.findById(params.id);
    if (!complaint) return NextResponse.json({ error: "Complaint not found" }, { status: 404 });

    const validTransitions = {
      admin: { pending: ["assigned"], assigned: ["in_progress", "pending"], in_progress: ["resolved", "closed"], resolved: ["closed"] },
      staff: { assigned: ["in_progress"], in_progress: ["resolved"] },
      student: {},
    };

    // Admin: assign complaint to staff
    if (authUser.role === "admin" && body.assignedTo !== undefined) {
      const previousStatus = complaint.status;
      complaint.assignedTo = body.assignedTo || null;
      if (body.assignedTo && complaint.status === "pending") {
        complaint.status = "assigned";
        complaint.statusHistory.push({ status: "assigned", changedBy: authUser.id, remark: body.remark || "Assigned to staff" });
        // Notify student
        await Notification.create({ userId: complaint.createdBy, message: `Your complaint "${complaint.title}" has been assigned to a staff member.`, type: "complaint_assigned", complaintId: complaint._id });
        // Notify staff
        await Notification.create({ userId: body.assignedTo, message: `You have been assigned a new complaint: "${complaint.title}".`, type: "complaint_assigned", complaintId: complaint._id });
      }
    }

    // Status update
    if (body.status && body.status !== complaint.status) {
      const allowed = validTransitions[authUser.role]?.[complaint.status] || [];
      if (!allowed.includes(body.status) && authUser.role !== "admin") {
        return NextResponse.json({ error: `Cannot transition from ${complaint.status} to ${body.status}` }, { status: 400 });
      }
      complaint.status = body.status;
      complaint.statusHistory.push({ status: body.status, changedBy: authUser.id, remark: body.remark || "" });

      // Notify student of status change
      await Notification.create({
        userId: complaint.createdBy,
        message: `Your complaint "${complaint.title}" status updated to: ${body.status.replace("_", " ")}.`,
        type: body.status === "resolved" ? "complaint_resolved" : "status_updated",
        complaintId: complaint._id,
      });
    }

    if (body.remarks) complaint.remarks = body.remarks;
    if (authUser.role === "admin" && body.priority) complaint.priority = body.priority;

    await complaint.save();
    const updated = await Complaint.findById(params.id)
      .populate("category", "name")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    return NextResponse.json({ complaint: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const complaint = await Complaint.findById(params.id);
    if (!complaint) return NextResponse.json({ error: "Complaint not found" }, { status: 404 });

    if (authUser.role === "student") {
      if (complaint.createdBy.toString() !== authUser.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      if (complaint.status !== "pending") return NextResponse.json({ error: "Can only delete pending complaints" }, { status: 400 });
    } else if (authUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await complaint.deleteOne();
    return NextResponse.json({ message: "Complaint deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
