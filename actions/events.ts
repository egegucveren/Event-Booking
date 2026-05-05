"use server";

// Server actions for event management: create, update, and delete.
// All actions verify the user is an organiser and validate input before touching the database.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { execute, query } from "@/lib/db";
import { toSqlDateTime } from "@/lib/format";
import { eventDeleteSchema, eventSchema, idleFormState, validationErrorState } from "@/lib/validation";

export async function createEventAction(_: typeof idleFormState, formData: FormData) {
  const organiser = await requireRole("organiser");

  const parsed = eventSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    venue: formData.get("venue"),
    city: formData.get("city"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    price: formData.get("price"),
    capacity: formData.get("capacity"),
    excerpt: formData.get("excerpt"),
    description: formData.get("description"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  await execute(
    `
      INSERT INTO events (
        organiser_id,
        title,
        category,
        venue,
        city,
        starts_at,
        ends_at,
        price_cents,
        capacity,
        excerpt,
        description,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      organiser.id,
      parsed.data.title,
      parsed.data.category,
      parsed.data.venue,
      parsed.data.city,
      toSqlDateTime(parsed.data.startsAt),
      toSqlDateTime(parsed.data.endsAt),
      Math.round(parsed.data.price * 100),
      parsed.data.capacity,
      parsed.data.excerpt,
      parsed.data.description,
      parsed.data.status
    ]
  );

  revalidatePath("/");
  revalidatePath("/organiser");
  redirect("/organiser?notice=event-created");
}

export async function updateEventAction(_: typeof idleFormState, formData: FormData) {
  const organiser = await requireRole("organiser");

  const eventId = Number(formData.get("eventId"));
  if (!eventId) {
    return {
      status: "error" as const,
      message: "Missing event reference."
    };
  }

  const parsed = eventSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    venue: formData.get("venue"),
    city: formData.get("city"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    price: formData.get("price"),
    capacity: formData.get("capacity"),
    excerpt: formData.get("excerpt"),
    description: formData.get("description"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const [ownership] = await query<Array<{ id: number }>>(
    "SELECT id FROM events WHERE id = ? AND organiser_id = ? LIMIT 1",
    [eventId, organiser.id]
  );

  if (!ownership) {
    return {
      status: "error" as const,
      message: "That event could not be found."
    };
  }

  await execute(
    `
      UPDATE events
      SET
        title = ?,
        category = ?,
        venue = ?,
        city = ?,
        starts_at = ?,
        ends_at = ?,
        price_cents = ?,
        capacity = ?,
        excerpt = ?,
        description = ?,
        status = ?
      WHERE id = ? AND organiser_id = ?
    `,
    [
      parsed.data.title,
      parsed.data.category,
      parsed.data.venue,
      parsed.data.city,
      toSqlDateTime(parsed.data.startsAt),
      toSqlDateTime(parsed.data.endsAt),
      Math.round(parsed.data.price * 100),
      parsed.data.capacity,
      parsed.data.excerpt,
      parsed.data.description,
      parsed.data.status,
      eventId,
      organiser.id
    ]
  );

  // When an event is cancelled, cancel all confirmed bookings so attendees
  // are not left with a "Confirmed" status on a cancelled event.
  if (parsed.data.status === "cancelled") {
    await execute(
      `UPDATE bookings SET status = 'cancelled' WHERE event_id = ? AND status = 'confirmed'`,
      [eventId]
    );
    revalidatePath("/attendee");
  }

  revalidatePath("/");
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/organiser");
  redirect("/organiser?notice=event-updated");
}

export async function deleteEventAction(formData: FormData) {
  const organiser = await requireRole("organiser");

  const parsed = eventDeleteSchema.safeParse({
    eventId: formData.get("eventId")
  });

  if (!parsed.success) {
    redirect("/organiser");
  }

  await execute("DELETE FROM events WHERE id = ? AND organiser_id = ?", [
    parsed.data.eventId,
    organiser.id
  ]);

  revalidatePath("/");
  revalidatePath("/organiser");
  redirect("/organiser?notice=event-deleted");
}
