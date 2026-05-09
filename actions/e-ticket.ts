"use server";

import { randomBytes } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { query, withTransaction } from "@/lib/db";

function createCardNumber() {
  // Random card numbers make each yearly card unique.
  return `PP${randomBytes(7).toString("hex").toUpperCase()}`;
}

async function createCardForUser(userId: number) {
  return withTransaction(async (conn) => {
    // A user should only have one active e-ticket card at a time.
    await conn.execute(
      `
        UPDATE e_ticket_cards
        SET status = 'expired'
        WHERE user_id = ?
          AND status = 'active'
      `,
      [userId]
    );

    let cardId = 0;

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        // The expiry date is exactly one year after the card is created.
        const [result]: any = await conn.execute(
          `
            INSERT INTO e_ticket_cards (user_id, card_number, status, issued_at, expires_at)
            VALUES (?, ?, 'active', NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR))
          `,
          [userId, createCardNumber()]
        );
        cardId = Number(result.insertId);
        break;
      } catch (err: any) {
        if (err.code !== "ER_DUP_ENTRY" || attempt === 4) throw err;
      }
    }

    // Older confirmed bookings without a card are moved onto the new card.
    await conn.execute(
      `
        UPDATE bookings
        SET e_ticket_card_id = ?
        WHERE attendee_id = ?
          AND e_ticket_card_id IS NULL
          AND status = 'confirmed'
      `,
      [cardId, userId]
    );

    return cardId;
  });
}

async function hasActiveCard(userId: number) {
  // This check stops users from renewing before the one-year period ends.
  const rows = await query<Array<{ id: number }>>(
    `
      SELECT id
      FROM e_ticket_cards
      WHERE user_id = ?
        AND status = 'active'
        AND expires_at > NOW()
      LIMIT 1
    `,
    [userId]
  );

  return rows.length > 0;
}

export async function buyETicketCardAction() {
  const attendee = await requireRole("attendee");

  if (await hasActiveCard(attendee.id)) {
    redirect("/e-ticket?notice=ecard-already-active");
  }

  await createCardForUser(attendee.id);

  revalidatePath("/e-ticket");
  revalidatePath("/attendee");
  redirect("/e-ticket?notice=ecard-created");
}

export async function renewETicketCardAction() {
  const attendee = await requireRole("attendee");

  if (await hasActiveCard(attendee.id)) {
    redirect("/e-ticket?notice=ecard-renew-too-early");
  }

  await createCardForUser(attendee.id);

  revalidatePath("/e-ticket");
  revalidatePath("/attendee");
  redirect("/e-ticket?notice=ecard-renewed");
}
