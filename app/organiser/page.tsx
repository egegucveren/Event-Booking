// Organiser dashboard: lists owned events, booking stats, and management actions.
import Link from "next/link";

import { deleteEventAction } from "@/actions/events";
import { buttonClassName } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { NoticeBanner } from "@/components/ui/notice-banner";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireRole } from "@/lib/auth";
import { formatCurrencyFromCents, formatDateRange } from "@/lib/format";
import { getNotice } from "@/lib/notices";
import { getOrganiserEvents, getOrganiserStats } from "@/lib/queries";

type OrganiserPageProps = {
  searchParams?: Promise<{
    notice?: string;
  }>;
};

export default async function OrganiserPage({ searchParams }: OrganiserPageProps) {
  const organiser = await requireRole("organiser");
  const [events, stats] = await Promise.all([getOrganiserEvents(organiser.id), getOrganiserStats(organiser.id)]);
  const notice = getNotice((await searchParams)?.notice);

  return (
    <section className="section stack-xl">
      {notice ? <NoticeBanner text={notice.text} tone={notice.tone} /> : null}

      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Organiser command centre</p>
          <h1>Shape the event pipeline, track bookings, and keep every listing polished.</h1>
          <p>
            Welcome back, {organiser.name}. Manage your events, track bookings, and grow your audience — all from one place.
          </p>
        </div>
        <Link className={buttonClassName("primary")} href="/organiser/events/new">
          Create New Event
        </Link>
      </div>

      <div className="metric-grid metric-grid--dashboard">
        <div className="metric-card">
          <strong>{stats.liveEvents}</strong>
          <span>Events created</span>
        </div>
        <div className="metric-card">
          <strong>{stats.totalBookings}</strong>
          <span>Confirmed bookings</span>
        </div>
        <div className="metric-card">
          <strong>{stats.seatsSold}</strong>
          <span>Seats sold</span>
        </div>
        <div className="metric-card">
          <strong>{formatCurrencyFromCents(stats.revenueCents)}</strong>
          <span>Gross revenue</span>
        </div>
      </div>

      {events.length === 0 ? (
        <EmptyState
          body="Build your first listing to unlock the public storefront and attendee booking flow."
          ctaHref="/organiser/events/new"
          ctaLabel="Publish First Event"
          title="No events created yet"
        />
      ) : (
        <div className="manage-grid">
          {events.map((event) => {
            const soldRatio = event.capacity === 0 ? 0 : Math.min((event.bookedSeats / event.capacity) * 100, 100);
            return (
              <article className="manage-card" key={event.id}>
                <div className="manage-card__header">
                  <div>
                    <p className="eyebrow">{event.category}</p>
                    <h3>{event.title}</h3>
                  </div>
                  <StatusBadge
                    label={event.status === "scheduled" ? "Scheduled" : "Cancelled"}
                    tone={event.status === "scheduled" ? "success" : "warning"}
                  />
                </div>

                <p className="manage-card__excerpt">{event.excerpt}</p>

                <div className="manage-card__stats">
                  <span>{formatDateRange(event.startsAt, event.endsAt)}</span>
                  <span>
                    {event.venue}, {event.city}
                  </span>
                  <span>{formatCurrencyFromCents(event.priceCents)}</span>
                </div>

                <div className="capacity-bar">
                  <span style={{ width: `${soldRatio}%` }} />
                </div>

                <div className="manage-card__footer">
                  <p>
                    {event.bookedSeats} / {event.capacity} seats booked
                  </p>
                  <div className="row gap-sm wrap">
                    <Link className={buttonClassName("ghost", "sm")} href={`/events/${event.id}`}>
                      Preview
                    </Link>
                    <Link className={buttonClassName("secondary", "sm")} href={`/organiser/events/${event.id}/edit`}>
                      Edit
                    </Link>
                    <form action={deleteEventAction}>
                      <input name="eventId" type="hidden" value={event.id} />
                      <button className={buttonClassName("danger", "sm")} type="submit">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
