import { redirect } from "next/navigation";

import { getRoleHome, requireUser } from "@/lib/auth";

export default async function DashboardRedirectPage() {
  const user = await requireUser();
  redirect(getRoleHome(user.role));
}
