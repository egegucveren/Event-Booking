import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";
import { formatCurrencyFromCents, formatDateRange, parseSqlDateTime } from "@/lib/format";
import type { EventCardData } from "@/lib/types";

type EventCardProps = {
  event: EventCardData;
  variant?: "default" | "showcase";
};

export function EventCard({ event, variant = "default" }: EventCardProps) {
  const startDate = parseSqlDateTime(event.startsAt);
  const dayLabel = new Intl.DateTimeFormat("en-IE", { day: "2-digit" }).format(startDate);
  const monthLabel = new Intl.DateTimeFormat("en-IE", { month: "short" }).format(startDate);
  const showcasePosterStyle = {
    backgroundImage: `linear-gradient(180deg, rgba(13, 22, 33, 0.14), rgba(13, 22, 33, 0.56)), url(${event.imagePath})`
  };
  const defaultPosterStyle = {
    backgroundImage: `radial-gradient(circle at 18% 22%, rgba(255, 255, 255, 0.26), transparent 18%), linear-gradient(180deg, rgba(11, 20, 31, 0.12), rgba(11, 20, 31, 0.48)), url(${event.imagePath})`
  };

  if (variant === "showcase") {
    return (
      <article className="event-card event-card--showcase" data-category={event.category.toLowerCase()}>
        <div className="event-card__poster" style={showcasePosterStyle}>
          <div className="event-card__poster-top">
            <span className="status-badge status-badge--default">{event.category}</span>
            <span className="event-card__city-tag">{event.city}</span>
          </div>
          <div className="event-card__poster-date">
            <span>{dayLabel}</span>
            <strong>{monthLabel}</strong>
          </div>
          <div className="event-card__poster-copy">
            <p>{event.venue}</p>
            <strong>{event.title}</strong>
            <span>{formatDateRange(event.startsAt, event.endsAt)}</span>
          </div>
        </div>

        <div className="event-card__content event-card__content--showcase">
          <div className="event-card__topline">
            <p>Hosted by {event.organiserName}</p>
            <p>{event.status.charAt(0).toUpperCase() + event.status.slice(1)}</p>
          </div>
          <h3>{event.title}</h3>
          <p className="event-card__excerpt">{event.excerpt}</p>
          <div className="event-card__meta">
            <span>{event.venue}</span>
            <span>{event.capacity} capacity</span>
            <span>{event.remainingSeats} seats left</span>
          </div>
          <div className="event-card__footer">
            <div>
              <span className="event-card__price-label">From</span>
              <p className="event-card__price">{formatCurrencyFromCents(event.priceCents)}</p>
            </div>
            <Link className={buttonClassName("primary", "sm")} href={`/events/${event.id}`}>
              View Event
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={`event-card event-card--${variant}`} data-category={event.category.toLowerCase()}>
      <div className="event-card__media" style={defaultPosterStyle}>
        <div className="event-card__badge-row">
          <span className="status-badge status-badge--default">{event.category}</span>
          <span className="event-card__city">{event.city}</span>
        </div>
        <div className="event-card__headline">
          <p>{event.venue}</p>
          <strong>{formatDateRange(event.startsAt, event.endsAt)}</strong>
        </div>
        <div className="event-card__glow" />
      </div>
      <div className="event-card__content">
        <div className="event-card__topline">
          <p>Hosted by {event.organiserName}</p>
          <p>{event.remainingSeats} seats left</p>
        </div>
        <h3>{event.title}</h3>
        <p className="event-card__excerpt">{event.excerpt}</p>
        <div className="event-card__meta">
          <span>{event.capacity} capacity</span>
          <span>{event.status}</span>
        </div>
        <div className="event-card__footer">
          <div>
            <p className="event-card__price">{formatCurrencyFromCents(event.priceCents)}</p>
            <span>Fast confirmation flow</span>
          </div>
          <Link className={buttonClassName("ghost", "sm")} href={`/events/${event.id}`}>
            View Event
          </Link>
        </div>
      </div>
    </article>
  );
}
