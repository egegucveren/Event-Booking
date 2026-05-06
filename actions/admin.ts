"use server";

// Server actions for admin operations: change user roles, delete users, and delete any event.
// Only the owner account can promote/demote or delete other admin accounts.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { execute, query, withTransaction } from "@/lib/db";
import { eventDeleteSchema, roleUpdateSchema, userDeleteSchema } from "@/lib/validation";

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

// Allows any admin to delete any event regardless of who created it.
// Cancels all confirmed bookings for that event before removing it.
export async function adminDeleteEventAction(formData: FormData) {
  await requireRole("admin");

  const parsed = eventDeleteSchema.safeParse({ eventId: formData.get("eventId") });

  if (!parsed.success) {
    redirect("/admin");
  }

  // Both operations run together so a mid-way failure cannot leave orphaned bookings.
  await withTransaction(async (conn) => {
    await conn.execute(
      `UPDATE bookings SET status = 'cancelled' WHERE event_id = ? AND status = 'confirmed'`,
      [parsed.data.eventId]
    );
    await conn.execute("DELETE FROM events WHERE id = ?", [parsed.data.eventId]);
  });

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin?notice=event-deleted");
}
