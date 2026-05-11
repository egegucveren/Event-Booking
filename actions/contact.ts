"use server";

// Server actions for contact tickets: create visitor messages and resolve them from admin.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { execute } from "@/lib/db";
import type { FormState } from "@/lib/types";
import { contactSchema, ticketResolveSchema, validationErrorState } from "@/lib/validation";

export async function submitContactAction(state: FormState, formData: FormData): Promise<FormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message")
  });

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  try {
    await execute(
      "INSERT INTO contact_tickets (name, email, message) VALUES (?, ?, ?)",
      [parsed.data.name, parsed.data.email, parsed.data.message]
    );
  } catch {
    return {
      status: "error",
      message: "Could not save your message right now. Please try again later or email us directly."
    };
  }

  revalidatePath("/admin");
  return { status: "success", message: "Your message has been sent. We will get back to you soon." };
}

export async function resolveTicketAction(formData: FormData) {
  await requireRole("admin");

  const parsed = ticketResolveSchema.safeParse({ ticketId: formData.get("ticketId") });
  if (!parsed.success) {
    redirect("/admin");
  }

  await execute("UPDATE contact_tickets SET status = 'resolved' WHERE id = ?", [parsed.data.ticketId]);

  revalidatePath("/admin");
  redirect("/admin?notice=ticket-resolved");
}
