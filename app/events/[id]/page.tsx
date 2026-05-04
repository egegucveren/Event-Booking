import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonClassName } from "@/components/ui/button";
import { getEventById } from "@/lib/queries";
import { formatCurrencyFromCents, formatDateRange } from "@/lib/format";

type EventDetailProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EventDetailPage({ params }: EventDetailProps) {
  const { id } = await params;
  const event = await getEventById(Number(id));

  if (!event) {
    notFound();
  }

  return (
    <section className="section">
      <div className="glass-panel stack-lg">
        <Link href="/#events">← Back to events</Link>

        <div className="detail-grid">
          <div className="stack-md">
            <p className="market-hero__eyebrow">{event.category}</p>
            <h1>{event.title}</h1>
            <p>{event.excerpt}</p>

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
                <span className="detail-meta__label">Seats left</span>
                <strong>{event.remainingSeats}</strong>
              </div>
            </div>

            <h2>About this event</h2>
            <p>{event.description}</p>
          </div>

          <aside className="glass-panel stack-md">
            <span>Ticket price</span>
            <strong>{formatCurrencyFromCents(event.priceCents)}</strong>

            <Link className={buttonClassName("primary")} href="/login">
              Book Now
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
