import { redirect } from "next/navigation";
import { getAuthUser } from "@/middleware/auth";

export default async function Home() {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  redirect(`/dashboard/${user.role}`);
}
