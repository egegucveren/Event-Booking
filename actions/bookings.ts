"use server";

// Server actions for bookings: create and cancel.
// Booking creation uses a database transaction with SELECT FOR UPDATE to prevent
// race conditions when multiple users attempt to book the same event simultaneously.
import { randomBytes } from "node:crypto";

import type { RowDataPacket } from "mysql2";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { execute, query, withTransaction } from "@/lib/db";
import { getActiveETicketCard, getEventById } from "@/lib/queries";
import { bookingCancelSchema, bookingSchema, idleFormState, validationErrorState } from "@/lib/validation";

function createBookingCode() {
  // Use all 8 hex chars (16^8 is about 4B combinations), no slice.
  return `PP-${randomBytes(4).toString("hex").toUpperCase()}`;
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

  const card = await getActiveETicketCard(attendee.id);
  if (!card) {
    return {
      status: "error" as const,
      message: "You need an active e-ticket card before confirming a booking. Open E-Ticket Card to get or renew your card."
    };
  }

  // The booking is connected to the active card, so the ticket can appear on the e-ticket page.
  // Use a transaction with SELECT FOR UPDATE to serialize concurrent booking
  // attempts for the same event, preventing race conditions on seat capacity.
  const result = await withTransaction(async (conn) => {
    const [eventRows] = await conn.query<RowDataPacket[]>(
      `SELECT capacity, status FROM events WHERE id = ? FOR UPDATE`,
      [event.id]
    );

    const lockedEvent = eventRows[0];
    if (!lockedEvent || lockedEvent.status !== "scheduled") {
      return {
        status: "error" as const,
        message: "This event is no longer accepting bookings."
      };
    }

    const [seatRows] = await conn.query<RowDataPacket[]>(
      `SELECT COALESCE(SUM(seats), 0) AS bookedSeats FROM bookings WHERE event_id = ? AND status = 'confirmed'`,
      [event.id]
    );

    const bookedSeats = Number(seatRows[0]?.bookedSeats ?? 0);
    if (lockedEvent.capacity - bookedSeats < parsed.data.seats) {
      return {
        status: "error" as const,
        message: "There are not enough seats left for that booking."
      };
    }

    const [dupRows] = await conn.query<RowDataPacket[]>(
      `SELECT id FROM bookings WHERE event_id = ? AND attendee_id = ? AND status = 'confirmed' LIMIT 1`,
      [event.id, attendee.id]
    );

    if (dupRows.length) {
      return {
        status: "error" as const,
        message: "You already have a confirmed booking for this event."
      };
    }

    // Retry up to 5 times on the unlikely event of a booking code collision
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        await conn.execute(
          `INSERT INTO bookings (code, event_id, attendee_id, e_ticket_card_id, seats, total_cents, status) VALUES (?, ?, ?, ?, ?, ?, 'confirmed')`,
          [createBookingCode(), event.id, attendee.id, card.id, parsed.data.seats, event.priceCents * parsed.data.seats]
        );
        break;
      } catch (err: any) {
        if (err.code !== "ER_DUP_ENTRY" || attempt === 4) throw err;
      }
    }

    return { status: "success" as const };
  });

  if (result.status === "error") {
    return result;
  }

  revalidatePath(`/events/${event.id}`);
  revalidatePath("/attendee");
  revalidatePath("/e-ticket");
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

  const [booking] = await query<Array<{ event_id: number }>>(
    `SELECT event_id FROM bookings WHERE id = ? AND attendee_id = ? AND status = 'confirmed' LIMIT 1`,
    [parsed.data.bookingId, attendee.id]
  );

  if (!booking) {
    redirect("/attendee");
  }

  await execute(
    `UPDATE bookings SET status = 'cancelled' WHERE id = ? AND attendee_id = ?`,
    [parsed.data.bookingId, attendee.id]
  );

  revalidatePath(`/events/${booking.event_id}`);
  revalidatePath("/attendee");
  revalidatePath("/e-ticket");
  revalidatePath("/");
  redirect("/attendee?notice=booking-cancelled");
}
