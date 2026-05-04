import { getSessionUser } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonClassName } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrencyFromCents, formatDateRange } from "@/lib/format";
import { getEventById } from "@/lib/queries";

type EventDetailProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EventDetailPage({ params }: EventDetailProps) {
  const { id } = await params;
  const event = await getEventById(Number(id));
  const user = await getSessionUser();

  if (!event) {
    notFound();
  }

  const detailBannerStyle = {
    backgroundImage: `linear-gradient(90deg, rgba(7, 18, 30, 0.82) 0%, rgba(7, 18, 30, 0.5) 50%, rgba(7, 18, 30, 0.15) 100%), url(${event.imagePath})`,
    backgroundPosition: event.imagePosition.detail,
    backgroundSize: event.imageSize.detail
  };

  return (
    <section className="section event-detail-page">
      <Link className="event-detail-back" href="/#events">
        ← Back to events
      </Link>

      <div className="event-detail-hero" style={detailBannerStyle}>
        <div className="event-detail-hero__content">
          <StatusBadge label={event.category} />
          <h1>{event.title}</h1>
          <p>{event.excerpt}</p>
        </div>
      </div>

      <div className="event-detail-grid">
        <article className="glass-panel stack-lg">
          <div className="detail-meta">
            <div>
              <span className="detail-meta__label">When</span>
              <strong>{formatDateRange(event.startsAt, event.endsAt)}</strong>
            </div>

            <div>
              <span className="detail-meta__label">Where</span>
              <strong>
                {event.venue}, {event.city}
              </strong>
            </div>

            <div>
              <span className="detail-meta__label">Capacity</span>
              <strong>{event.capacity} guests</strong>
            </div>

            <div>
              <span className="detail-meta__label">Seats left</span>
              <strong>{event.remainingSeats}</strong>
            </div>
          </div>

          <div className="stack-md">
            <h2>About this event</h2>
            <p>{event.description}</p>
          </div>
        </article>

        <aside className="glass-panel stack-md event-booking-card">
          <span>Ticket price</span>
          <strong>{formatCurrencyFromCents(event.priceCents)}</strong>
          <p>Reserve your seat and manage your booking from your attendee account.</p>

          <Link
  className={buttonClassName("primary")}
  href={user ? "/attendee" : "/login"}
>
  {user ? "Reserve Seat" : "Login to Book"}
</Link>
        </aside>
      </div>
    </section>
  );
}