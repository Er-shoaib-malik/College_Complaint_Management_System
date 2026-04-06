import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/Notification";
import { getAuthUser } from "@/middleware/auth";

export async function POST() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await dbConnect();
    await Notification.updateMany({ userId: authUser.id, isRead: false }, { isRead: true });
    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
