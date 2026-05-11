import Link from "next/link";

import { buyETicketCardAction, renewETicketCardAction } from "@/actions/e-ticket";
import { EmptyState } from "@/components/ui/empty-state";
import { NoticeBanner } from "@/components/ui/notice-banner";
import { StatusBadge } from "@/components/ui/status-badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { TicketQr } from "@/components/ui/ticket-qr";
import { buttonClassName } from "@/components/ui/button";
import { requireRole } from "@/lib/auth";
import { formatCurrencyFromCents, formatEventDate, formatFullDateTime } from "@/lib/format";
import { getNotice } from "@/lib/notices";
import { getAttendeeETicketCard, getETicketCardBookings } from "@/lib/queries";

type ETicketPageProps = {
  searchParams?: Promise<{
    notice?: string;
  }>;
};

const cardPurposes = [
  "Prevent fake ticket sales",
  "Stop banned or penalized users from entering venues",
  "Reduce ticket black market resale"
];

export default async function ETicketPage({ searchParams }: ETicketPageProps) {
  // Only attendee users can open this page because tickets belong to attendees.
  const attendee = await requireRole("attendee");
  const card = await getAttendeeETicketCard(attendee.id);
  // Tickets are shown only for the selected user's own e-ticket card.
  const tickets = card ? await getETicketCardBookings(attendee.id, card.id) : [];
  const notice = getNotice((await searchParams)?.notice);

  return (
    <section className="section stack-xl">
      {notice ? <NoticeBanner text={notice.text} tone={notice.tone} /> : null}

      <div className="dashboard-hero ecard-hero">
        <div>
          <p className="eyebrow">E-ticket card</p>
          <h1>One yearly card for secure event entry and QR ticket access.</h1>
          <p>
            Your confirmed tickets are assigned to your active card. Renew it once a year to keep ticket purchases and
            venue entry available.
          </p>
        </div>
        <Link className={buttonClassName("secondary", "sm")} href="/#events">
          Browse Events
        </Link>
      </div>

      <div className="ecard-layout">
        <aside className="ecard-panel stack-lg">
          <div className="section-heading">
            <p className="eyebrow">Card purchase</p>
            <h2>What is this card for?</h2>
            <p>
              The e-ticket card is a yearly digital card that verifies ticket ownership and supports QR-based venue
              entry checks.
            </p>
          </div>

          <ul className="ecard-purpose-list">
            {cardPurposes.map((purpose) => (
              <li key={purpose}>{purpose}</li>
            ))}
          </ul>

          {/* Active cards cannot be renewed until they expire. */}
          <form action={card && !card.isValid ? renewETicketCardAction : buyETicketCardAction}>
            <SubmitButton
              disabled={Boolean(card?.isValid)}
              label={card?.isValid ? "Renew Available After Expiry" : card ? "Renew Card" : "Get E-Ticket Card"}
              pendingLabel={card ? "Renewing..." : "Creating..."}
            />
          </form>
        </aside>

        <div className="stack-lg">
          <article className="ecard-visual">
            <div>
              <p className="eyebrow">PulsePass card</p>
              <h2>{attendee.name}</h2>
              <p>{attendee.email}</p>
            </div>

            {card ? (
              <>
                <div className="ecard-visual__number">{card.cardNumber}</div>
                <div className="ecard-visual__meta">
                  <span>Issued {formatFullDateTime(card.issuedAt)}</span>
                  <span>Expires {formatFullDateTime(card.expiresAt)}</span>
                </div>
                <StatusBadge label={card.isValid ? "Active" : "Expired"} tone={card.isValid ? "success" : "warning"} />
              </>
            ) : (
              <>
                <div className="ecard-visual__number">No active card</div>
                <p>Get your yearly card before confirming new ticket purchases.</p>
                <StatusBadge label="Required" tone="warning" />
              </>
            )}
          </article>

          <div className="section-heading">
            <p className="eyebrow">Card tickets</p>
            <h2>Tickets assigned to this card</h2>
            <p>Show the QR code at venue entry. Cancelled tickets stay visible as history but cannot be used for entry.</p>
          </div>

          {!card ? (
            <EmptyState
              body="Create your yearly e-ticket card first, then your confirmed tickets will appear here."
              ctaHref="/#events"
              ctaLabel="Browse Events"
              title="No card yet"
            />
          ) : tickets.length === 0 ? (
            <EmptyState
              body="Book an event and the ticket will be assigned to your active e-ticket card."
              ctaHref="/#events"
              ctaLabel="Find Events"
              title="No tickets on this card"
            />
          ) : (
            <div className="ecard-ticket-grid">
              {tickets.map((ticket) => (
                <article className="ecard-ticket" key={ticket.id}>
                  <div className="ecard-ticket__main">
                    <div className="booking-card__header">
                      <div>
                        <p className="eyebrow">Ticket {ticket.code}</p>
                        <h3>{ticket.eventTitle}</h3>
                      </div>
                      <StatusBadge
                        label={ticket.status === "confirmed" ? "Confirmed" : "Cancelled"}
                        tone={ticket.status === "confirmed" && card.isValid ? "success" : "warning"}
                      />
                    </div>
                    <div className="booking-card__meta">
                      <span>{formatEventDate(ticket.startsAt)}</span>
                      <span>
                        {ticket.venue}, {ticket.city}
                      </span>
                      <span>{ticket.seats} seats</span>
                      <span>{formatCurrencyFromCents(ticket.totalCents)}</span>
                    </div>
                  </div>
                  {/* The ticket code is sent to the QR component as the QR value. */}
                  <TicketQr label={`QR code for ticket ${ticket.code}`} value={ticket.code} />
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
