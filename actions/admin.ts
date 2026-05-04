"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { execute, query } from "@/lib/db";
import { roleUpdateSchema, userDeleteSchema } from "@/lib/validation";

export async function updateUserRoleAction(formData: FormData) {
  const admin = await requireRole("admin");

  const parsed = roleUpdateSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role")
  });

  if (!parsed.success) {
    redirect("/admin");
  }

  // Cannot demote yourself
  if (parsed.data.userId === admin.id) {
    redirect("/admin");
  }

  // Only the owner can grant or revoke admin role
  const [target] = await query<Array<{ role: string }>>(
    "SELECT role FROM users WHERE id = ? LIMIT 1",
    [parsed.data.userId]
  );

  const targetIsAdmin = target?.role === "admin";
  const changingToAdmin = parsed.data.role === "admin";

  if ((targetIsAdmin || changingToAdmin) && !admin.isOwner) {
    redirect("/admin");
  }

  await execute("UPDATE users SET role = ? WHERE id = ?", [parsed.data.role, parsed.data.userId]);

  revalidatePath("/admin");
  redirect("/admin?notice=role-updated");
}

export async function deleteUserAction(formData: FormData) {
  const admin = await requireRole("admin");

  const parsed = userDeleteSchema.safeParse({
    userId: formData.get("userId")
  });

  if (!parsed.success) {
    redirect("/admin");
  }

  // Cannot delete yourself
  if (parsed.data.userId === admin.id) {
    redirect("/admin");
  }

  // Only the owner can delete other admins
  const [target] = await query<Array<{ role: string }>>(
    "SELECT role FROM users WHERE id = ? LIMIT 1",
    [parsed.data.userId]
  );

  if (target?.role === "admin" && !admin.isOwner) {
    redirect("/admin");
  }

  await execute("DELETE FROM users WHERE id = ?", [parsed.data.userId]);

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin?notice=user-deleted");
}
