"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { execute } from "@/lib/db";
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

  if (parsed.data.userId === admin.id && parsed.data.role !== "admin") {
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

  if (parsed.data.userId === admin.id) {
    redirect("/admin");
  }

  await execute("DELETE FROM users WHERE id = ?", [parsed.data.userId]);

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin?notice=user-deleted");
}
