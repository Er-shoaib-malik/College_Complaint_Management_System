import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getAuthUser } from "@/middleware/auth";

export async function GET(request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const query = role ? { role } : {};
    const users = await User.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

    await dbConnect();
    const body = await request.json();
    const { name, email, password, role, department } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 409 });

    const user = await User.create({ name, email, password, role, department });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
