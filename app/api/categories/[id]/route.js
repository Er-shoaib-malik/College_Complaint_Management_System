import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import { getAuthUser } from "@/middleware/auth";

export async function PUT(request, { params }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
    await dbConnect();
    const body = await request.json();
    const category = await Category.findByIdAndUpdate(params.id, body, { new: true });
    if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ category });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
    await dbConnect();
    await Category.findByIdAndUpdate(params.id, { isActive: false });
    return NextResponse.json({ message: "Category deactivated" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
