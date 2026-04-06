import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Complaint from "@/models/Complaint";
import Notification from "@/models/Notification";
import { getAuthUser } from "@/middleware/auth";

export async function GET(request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    let query = {};

    if (authUser.role === "student") {
      query.createdBy = authUser.id;
    } else if (authUser.role === "staff") {
      query.assignedTo = authUser.id;
    }
    // admin sees all

    if (status) query.status = status;
    if (category) query.category = category;

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate("category", "name")
      .populate("createdBy", "name email rollNo")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      complaints,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (authUser.role !== "student") {
      return NextResponse.json({ error: "Only students can submit complaints" }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();
    const { title, description, category, priority } = body;

    if (!title || !description || !category) {
      return NextResponse.json({ error: "Title, description and category are required" }, { status: 400 });
    }

    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority: priority || "medium",
      createdBy: authUser.id,
      statusHistory: [{ status: "pending", changedBy: authUser.id, remark: "Complaint submitted" }],
    });

    await Notification.create({
      userId: authUser.id,
      message: `Your complaint "${title}" has been submitted successfully.`,
      type: "complaint_created",
      complaintId: complaint._id,
    });

    const populated = await complaint.populate(["category", "createdBy"]);
    return NextResponse.json({ complaint: populated }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
