import { cancelBookingAction } from "@/actions/bookings";
import { EventCard } from "@/components/ui/event-card";
import { EmptyState } from "@/components/ui/empty-state";
import { NoticeBanner } from "@/components/ui/notice-banner";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireRole } from "@/lib/auth";
import { buttonClassName } from "@/components/ui/button";
import { formatCurrencyFromCents, formatEventDate } from "@/lib/format";
import { getNotice } from "@/lib/notices";
import { getAttendeeBookings, getAttendeeStats, getFeaturedEvents } from "@/lib/queries";

type AttendeePageProps = {
  searchParams?: Promise<{
    notice?: string;
  }>;
};

export default async function AttendeePage({ searchParams }: AttendeePageProps) {
  const attendee = await requireRole("attendee");
  const [bookings, stats, suggestions] = await Promise.all([
    getAttendeeBookings(attendee.id),
    getAttendeeStats(attendee.id),
    getFeaturedEvents(3)
  ]);
  const notice = getNotice((await searchParams)?.notice);

  return (
    <section className="section stack-xl">
      {notice ? <NoticeBanner text={notice.text} tone={notice.tone} /> : null}

      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Attendee hub</p>
          <h1>Keep bookings close, discover new events quickly, and manage your plans with confidence.</h1>
          <p>The attendee area proves that the application supports meaningful end-user tasks, not just administration.</p>
        </div>
      </div>

      <div className="metric-grid metric-grid--dashboard">
        <div className="metric-card">
          <strong>{stats.upcomingEvents}</strong>
          <span>Upcoming events</span>
        </div>
        <div className="metric-card">
          <strong>{stats.totalBookings}</strong>
          <span>Bookings made</span>
        </div>
        <div className="metric-card">
          <strong>{stats.reservedSeats}</strong>
          <span>Reserved seats</span>
        </div>
        <div className="metric-card">
          <strong>{formatCurrencyFromCents(stats.spendCents)}</strong>
          <span>Total spend</span>
        </div>
      </div>

      <div className="stack-lg">
        <div className="section-heading">
          <p className="eyebrow">My bookings</p>
          <h2>Confirmed reservations and history</h2>
          <p>Bookings can be cancelled directly from this dashboard, with the change reflected back into the event inventory.</p>
        </div>

        {bookings.length === 0 ? (
          <EmptyState
            body="Browse the featured events below and reserve your first seats."
            ctaHref="/#events"
            ctaLabel="Discover Events"
            title="No bookings yet"
          />
        ) : (
          <div className="booking-grid">
            {bookings.map((booking) => (
              <article className="booking-card" key={booking.id}>
                <div className="booking-card__header">
                  <div>
                    <p className="eyebrow">Booking {booking.code}</p>
                    <h3>{booking.eventTitle}</h3>
                  </div>
                  <StatusBadge
                    label={booking.status === "confirmed" ? "Confirmed" : "Cancelled"}
                    tone={booking.status === "confirmed" ? "success" : "warning"}
                  />
                </div>

                <div className="booking-card__meta">
                  <span>{formatEventDate(booking.startsAt)}</span>
                  <span>
                    {booking.venue}, {booking.city}
                  </span>
                  <span>{booking.seats} seats</span>
                  <span>{formatCurrencyFromCents(booking.totalCents)}</span>
                </div>

                {booking.status === "confirmed" ? (
                  <form action={cancelBookingAction}>
                    <input name="bookingId" type="hidden" value={booking.id} />
                    <button className={buttonClassName("danger", "sm")} type="submit">
                      Cancel Booking
                    </button>
                  </form>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="stack-lg">
        <div className="section-heading">
          <p className="eyebrow">Suggested next</p>
          <h2>Continue discovering</h2>
          <p>Featured events remain visible to attendees so the booking journey can continue naturally after purchase.</p>
        </div>
        <div className="event-grid event-grid--compact">
          {suggestions.map((event) => (
            <EventCard event={event} key={event.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
