// Dashboard route: redirects signed-in users to the dashboard that matches their role.
import { redirect } from "next/navigation";

import { getRoleHome, requireUser } from "@/lib/auth";

export default async function DashboardRedirectPage() {
  const user = await requireUser();
  redirect(getRoleHome(user.role));
}
