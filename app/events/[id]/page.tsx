import Link from "next/link";
import { notFound } from "next/navigation";

import { BookingForm } from "@/components/forms/booking-form";
import { buttonClassName } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { getSessionUser } from "@/lib/auth";
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

  const attendeeCanBook = user?.role === "attendee" && event.status === "scheduled" && event.remainingSeats > 0;
  const detailBannerStyle = {
    backgroundImage: `linear-gradient(90deg, rgba(7, 18, 30, 0.78) 0%, rgba(7, 18, 30, 0.58) 42%, rgba(7, 18, 30, 0.22) 100%), url(${event.imagePath})`
  };

  return (
    <section className="detail-layout">
      <div className="detail-hero">
        <div className="detail-banner" data-category={event.category.toLowerCase()} style={detailBannerStyle}>
          <div className="detail-banner__overlay" />
          <div className="detail-banner__content">
            <StatusBadge label={event.category} />
            <h1>{event.title}</h1>
            <p>{event.excerpt}</p>
          </div>
        </div>

        <div className="detail-grid">
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
                <span className="detail-meta__label">Hosted by</span>
                <strong>{event.organiserName}</strong>
              </div>
              <div>
                <span className="detail-meta__label">Capacity</span>
                <strong>{event.capacity} guests</strong>
              </div>
            </div>

            <div className="stack-md">
              <h2>About this experience</h2>
              <p>{event.description}</p>
            </div>
          </article>

          <aside className="detail-sidebar">
            <div className="glass-panel stack-lg">
              <div className="price-block">
                <span>Ticket price</span>
                <strong>{formatCurrencyFromCents(event.priceCents)}</strong>
              </div>

              <div className="detail-sidebar__stats">
                <div>
                  <span>Seats left</span>
                  <strong>{event.remainingSeats}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{event.status === "scheduled" ? "Open" : "Cancelled"}</strong>
                </div>
              </div>

              {attendeeCanBook ? (
                <BookingForm eventId={event.id} />
              ) : user?.role === "attendee" ? (
                <p className="form-message form-message--info">
                  {event.remainingSeats === 0
                    ? "This event is currently sold out."
                    : "Bookings are not available for this event right now."}
                </p>
              ) : (
                <div className="stack-sm">
                  <p className="form-message form-message--info">
                    Sign in as an attendee to reserve seats and manage bookings.
                  </p>
                  <Link className={buttonClassName("secondary")} href="/login">
                    Go to Login
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
