// Spotlight page: highlights the most relevant upcoming event and supporting recommendations.
import type { CSSProperties } from "react";
import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrencyFromCents, formatDateRange, parseSqlDateTime } from "@/lib/format";
import { getFeaturedEvents, getSpotlightEvent } from "@/lib/queries";

function formatNumericDateRange(start: string | Date, end: string | Date) {
  // This compact numeric format keeps the supporting cards short and easy to scan.
  const startDate = parseSqlDateTime(start);
  const endDate = parseSqlDateTime(end);
  const dateLabel = [
    `${startDate.getDate()}`.padStart(2, "0"),
    `${startDate.getMonth() + 1}`.padStart(2, "0"),
    startDate.getFullYear()
  ].join(".");
  const startTime = `${`${startDate.getHours()}`.padStart(2, "0")}:${`${startDate.getMinutes()}`.padStart(2, "0")}`;
  const endTime = `${`${endDate.getHours()}`.padStart(2, "0")}:${`${endDate.getMinutes()}`.padStart(2, "0")}`;

  return `${dateLabel}, ${startTime} - ${endTime}`;
}

export default async function SpotlightPage() {
  // The page needs both the main spotlight event and a few nearby alternatives.
  const [spotlightEvent, recommendations] = await Promise.all([getSpotlightEvent(), getFeaturedEvents({ limit: 4 })]);
  const supportingEvents = recommendations.filter((event) => event.id !== spotlightEvent?.id).slice(0, 3);

  if (!spotlightEvent) {
    return (
      <section className="section stack-xl">
        <EmptyState
          body="New scheduled events will appear here as soon as organisers publish upcoming experiences."
          ctaHref="/#events"
          ctaLabel="Browse Events"
          title="No spotlight event is available yet"
        />
      </section>
    );
  }

  const heroStyle = {
    backgroundImage: `linear-gradient(90deg, rgba(7, 18, 30, 0.88), rgba(7, 18, 30, 0.48)), url(${spotlightEvent.imagePath})`,
    "--spotlight-image-position": spotlightEvent.imagePosition.detail,
    "--spotlight-image-size": spotlightEvent.imageSize.detail
  } as CSSProperties;
  // Clamp progress so the bar always stays within the visual track.
  const bookedPercent = Math.min(Math.round((spotlightEvent.bookedSeats / spotlightEvent.capacity) * 100), 100);

  return (
    <section className="section stack-xl">
      <div className="spotlight-hero" style={heroStyle}>
        <div className="spotlight-hero__content">
          <div className="row gap-sm wrap">
            <StatusBadge label="Spotlight" tone="warning" />
          </div>
          <p className="eyebrow">Featured experience</p>
          <h1>{spotlightEvent.title}</h1>
          <p>{spotlightEvent.description}</p>
          <div className="spotlight-hero__actions">
            <Link className={buttonClassName("primary")} href={`/events/${spotlightEvent.id}`}>
              View Event
            </Link>
            <Link className={buttonClassName("secondary")} href="/#events">
              Browse All
            </Link>
          </div>
        </div>

        <aside className="spotlight-panel">
          <span className="event-card__price-label">From</span>
          <strong>{formatCurrencyFromCents(spotlightEvent.priceCents)}</strong>
          <div className="spotlight-panel__meta">
            <span>{spotlightEvent.category}</span>
            <span>{spotlightEvent.city}</span>
            <span>{spotlightEvent.venue}</span>
            <span>{formatDateRange(spotlightEvent.startsAt, spotlightEvent.endsAt)}</span>
          </div>
          <div className="spotlight-progress-label">
            <span>Booking progress</span>
            <strong>{bookedPercent}% booked</strong>
          </div>
          <div className="spotlight-progress" aria-label={`${bookedPercent}% booked`}>
            <span style={{ width: `${bookedPercent}%` }} />
          </div>
          <p>
            {spotlightEvent.bookedSeats} booked / {spotlightEvent.remainingSeats} seats left
          </p>
        </aside>
      </div>

      <div className="spotlight-grid">
        <div className="glass-panel stack-md">
          <p className="eyebrow">Why this event</p>
          <h2>Chosen because it is the next scheduled experience with live availability.</h2>
          <p>
            The spotlight page promotes the event closest to today. If an event is running today, it gets priority;
            otherwise the next upcoming scheduled event is selected from MySQL automatically.
          </p>
        </div>

        <div className="glass-panel stack-md">
          <p className="eyebrow">Event snapshot</p>
          <div className="spotlight-stats">
            <div>
              <strong>{spotlightEvent.capacity}</strong>
              <span>Capacity</span>
            </div>
            <div>
              <strong>{spotlightEvent.bookedSeats}</strong>
              <span>Seats booked</span>
            </div>
            <div>
              <strong>{spotlightEvent.remainingSeats}</strong>
              <span>Seats left</span>
            </div>
          </div>
        </div>
      </div>

      {supportingEvents.length > 0 ? (
        <div className="glass-panel stack-md">
          <div className="section-heading">
            <p className="eyebrow">More coming up</p>
            <h2>Other experiences worth watching</h2>
          </div>
          <div className="spotlight-recommendations">
            {supportingEvents.map((event) => (
              <Link className="spotlight-mini-card" href={`/events/${event.id}`} key={event.id}>
                <span>{event.category}</span>
                <strong>{event.title}</strong>
                <small>
                  {event.city} / {formatNumericDateRange(event.startsAt, event.endsAt)}
                </small>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
