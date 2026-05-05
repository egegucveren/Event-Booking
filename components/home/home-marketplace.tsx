"use client";

import Link from "next/link";
import { useState } from "react";

import { SectionHeading } from "@/components/layout/section-heading";
import { buttonClassName } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { EmptyState } from "@/components/ui/empty-state";
import { EventCard } from "@/components/ui/event-card";
import { formatCurrencyFromCents } from "@/lib/format";
import type { DashboardStats, EventCardData } from "@/lib/types";

type HomeMarketplaceProps = {
  events: EventCardData[];
  stats: DashboardStats;
  user: {
    ctaHref: string;
    ctaLabel: string;
    organiserHref: string;
    organiserLabel: string;
  };
};

export function HomeMarketplace({ events, stats, user }: HomeMarketplaceProps) {
  const [selectedCategory, setSelectedCategory] = useState("All experiences");
  const [selectedCity, setSelectedCity] = useState("All cities");
  const [searchQuery, setSearchQuery] = useState("");

  const categoryOptions = ["All experiences", ...new Set(events.map((event) => event.category))];
  const cityOptions = [
    "All cities",
    ...new Set(
      events
        .filter((event) => selectedCategory === "All experiences" || event.category === selectedCategory)
        .map((event) => event.city)
    )
  ];

  const filteredEvents = events.filter((event) => {
    const searchText = `${event.title} ${event.city} ${event.category} ${event.excerpt}`.toLowerCase();
    const searchMatch = searchText.includes(searchQuery.toLowerCase());
    const categoryMatch = selectedCategory === "All experiences" || event.category === selectedCategory;
    const cityMatch = selectedCity === "All cities" || event.city === selectedCity;

    return searchMatch && categoryMatch && cityMatch;
  });
  const categoryFilteredEvents = events.filter(
    (event) => selectedCategory === "All experiences" || event.category === selectedCategory
  );

  const activeEvent = filteredEvents[0] ?? events[0] ?? null;
  const featuredPrice = activeEvent ? formatCurrencyFromCents(activeEvent.priceCents) : "EUR 0.00";
  const activeCategoryCount = categoryFilteredEvents.length;

  return (
    <div className="market-page">
      <section className="market-hero">
        <div className="market-hero__crumbs">
          <span>Home</span>
          <span>/</span>
          <span>Categories</span>
          <span>/</span>
          <span>Curated Event Experiences</span>
        </div>

        <div className="market-hero__intro">
          <div className="market-hero__copy">
            <p className="market-hero__eyebrow">Curated Event Tickets</p>
            <h1>Discover standout experiences in a browse-first ticket storefront.</h1>
            <p className="market-hero__body">
              Browse handpicked events, filter by category or city, and secure your seats in seconds.
            </p>
            <div className="row gap-sm wrap">
              <Link className={buttonClassName("primary")} href="#events">
                Browse Listings
              </Link>
              <Link className={buttonClassName("secondary")} href={user.ctaHref}>
                {user.ctaLabel}
              </Link>
            </div>
          </div>

          <div className="market-summary-card">
            <p className="market-summary-card__label">Featured price</p>
            <strong>{featuredPrice}</strong>
            <span>
              {activeEvent
                ? `Currently highlighting ${activeEvent.title} in ${activeEvent.city}.`
                : "Explore upcoming events and find your next experience."}
            </span>
            <div className="market-summary-card__stats">
              <div>
                <strong>{filteredEvents.length}</strong>
                <span>Visible listings</span>
              </div>
              <div>
                <strong>{stats.totalCities}</strong>
                <span>Destination cities</span>
              </div>
            </div>
          </div>
        </div>

        <div className="market-promo-strip">
          <div>
            <p className="market-promo-strip__eyebrow">Category spotlight</p>
            <h2>
              {activeEvent
                ? `${activeEvent.category} experiences with polished booking flow and premium event imagery.`
                : "Live sessions, workshops, and wellness experiences in one curated stream."}
            </h2>
            <p>
              Filter by category, browse by city, and book with confidence - every listing is updated in real time.
            </p>
          </div>
          <div className="market-promo-strip__meta">
            <div>
              <strong>{stats.totalBookings}</strong>
              <span>Confirmed seats</span>
            </div>
            <div>
              <strong>{activeCategoryCount}</strong>
              <span>In selected category</span>
            </div>
          </div>
        </div>
      </section>

      <section className="market-layout">
        <div className="market-content">
          <div className="market-spotlight">
            <div>
              <p className="market-spotlight__eyebrow">Editor&apos;s pick</p>
              <h3>{activeEvent ? activeEvent.title : "Make the listing area the main event."}</h3>
              <p>
                {activeEvent
                  ? activeEvent.excerpt
                  : "Select a category or city to highlight a featured event here."}
              </p>
            </div>
            <Link className={buttonClassName("secondary")} href={user.organiserHref}>
              {user.organiserLabel}
            </Link>
          </div>

          <div className="market-inline-filters" id="events">
            <input
              className="input"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by title, city, or category..."
              type="text"
              value={searchQuery}
            />
            <CustomSelect options={cityOptions} value={selectedCity} onChange={setSelectedCity} />
            <CustomSelect options={categoryOptions} value={selectedCategory} onChange={setSelectedCategory} />
          </div>

          <div className="market-listing-header">
            <SectionHeading
              eyebrow="Available listings"
              title="Browse upcoming featured event tickets"
              body={`Showing ${filteredEvents.length} listing${filteredEvents.length === 1 ? "" : "s"} for ${selectedCategory}${selectedCity === "All cities" ? "" : ` in ${selectedCity}`}.`}
            />
          </div>

          {filteredEvents.length === 0 ? (
            <EmptyState
              body="Adjust the category or city filters to reveal more events."
              ctaHref="#events"
              ctaLabel="Reset Filters"
              title="No events match these filters yet"
            />
          ) : (
            <div className="event-grid event-grid--showcase">
              {filteredEvents.map((event) => (
                <EventCard event={event} key={event.id} variant="showcase" />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
