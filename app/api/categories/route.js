import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import { getAuthUser } from "@/middleware/auth";

export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }
    await dbConnect();
    const { name, description } = await request.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const category = await Category.create({ name, description });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
