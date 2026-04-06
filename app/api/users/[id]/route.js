import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getAuthUser } from "@/middleware/auth";

export async function PUT(request, { params }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
    await dbConnect();
    const body = await request.json();
    delete body.password; // prevent password update via this route
    const user = await User.findByIdAndUpdate(params.id, body, { new: true });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
    await dbConnect();
    await User.findByIdAndUpdate(params.id, { isActive: false });
    return NextResponse.json({ message: "User deactivated" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
