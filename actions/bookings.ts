"use server";

import { randomBytes } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { execute, query } from "@/lib/db";
import { getEventById } from "@/lib/queries";
import { bookingCancelSchema, bookingSchema, idleFormState, validationErrorState } from "@/lib/validation";

function createBookingCode() {
  return `PP-${randomBytes(4).toString("hex").toUpperCase().slice(0, 6)}`;
}

export async function createBookingAction(_: typeof idleFormState, formData: FormData) {
  const attendee = await requireRole("attendee");

  const parsed = bookingSchema.safeParse({
    eventId: formData.get("eventId"),
    seats: formData.get("seats")
  });

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const event = await getEventById(parsed.data.eventId);
  if (!event) {
    return {
      status: "error" as const,
      message: "That event could not be found."
    };
  }

  if (event.status !== "scheduled") {
    return {
      status: "error" as const,
      message: "This event is no longer accepting bookings."
    };
  }

  if (event.remainingSeats < parsed.data.seats) {
    return {
      status: "error" as const,
      message: "There are not enough seats left for that booking."
    };
  }

  const [existingBooking] = await query<Array<{ id: number }>>(
    `
      SELECT id
      FROM bookings
      WHERE event_id = ? AND attendee_id = ? AND status = 'confirmed'
      LIMIT 1
    `,
    [event.id, attendee.id]
  );

  if (existingBooking) {
    return {
      status: "error" as const,
      message: "You already have a confirmed booking for this event."
    };
  }

  await execute(
    `
      INSERT INTO bookings (code, event_id, attendee_id, seats, total_cents, status)
      VALUES (?, ?, ?, ?, ?, 'confirmed')
    `,
    [createBookingCode(), event.id, attendee.id, parsed.data.seats, event.priceCents * parsed.data.seats]
  );

  revalidatePath(`/events/${event.id}`);
  revalidatePath("/attendee");
  redirect("/attendee?notice=booking-created");
}

export async function cancelBookingAction(formData: FormData) {
  const attendee = await requireRole("attendee");

  const parsed = bookingCancelSchema.safeParse({
    bookingId: formData.get("bookingId")
  });

  if (!parsed.success) {
    redirect("/attendee");
  }

  await execute(
    `
      UPDATE bookings
      SET status = 'cancelled'
      WHERE id = ? AND attendee_id = ?
    `,
    [parsed.data.bookingId, attendee.id]
  );

  revalidatePath("/attendee");
  revalidatePath("/");
  redirect("/attendee?notice=booking-cancelled");
}
