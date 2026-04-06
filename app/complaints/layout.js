import { redirect } from "next/navigation";
import { getAuthUser } from "@/middleware/auth";
import Navbar from "@/components/layout/Navbar";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export default async function ComplaintsLayout({ children }) {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/login");

  await dbConnect();
  const user = await User.findById(authUser.id).lean();
  if (!user) redirect("/login");

  const safeUser = { id: user._id.toString(), name: user.name, email: user.email, role: user.role };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={safeUser} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
