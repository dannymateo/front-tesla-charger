import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getRoleHomePath } from "@/lib/constants";

export default async function HomePage() {
  const session = await getSession();
  if (session) {
    redirect(getRoleHomePath(session.payload.role));
  }
  redirect("/login");
}
