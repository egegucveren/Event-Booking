"use client";

import { useState } from "react";

import { CustomSelect } from "@/components/ui/custom-select";

type EventSearchProps = {
  events: {
    id: number;
    title: string;
    city?: string;
    category?: string;
  }[];
};

export function EventSearch({ events }: EventSearchProps) {
  // These states store what the user types and selects in the search area.
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("All cities");
  const [category, setCategory] = useState("All categories");

  // Cities and categories come from the events, so there are no empty filter choices.
  const cityOptions = ["All cities", ...Array.from(new Set(events.map((e) => e.city).filter(Boolean) as string[]))];
  const categoryOptions = ["All categories", ...Array.from(new Set(events.map((e) => e.category).filter(Boolean) as string[]))];

  // Search works with title, city, and category, then combines this with the dropdown filters.
  const filteredEvents = events.filter((event) => {
    const text = `${event.title} ${event.city ?? ""} ${event.category ?? ""}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesCity = city === "All cities" || event.city === city;
    const matchesCategory = category === "All categories" || event.category === category;
    return matchesSearch && matchesCity && matchesCategory;
  });

  return (
    <section className="section section--tight">
      <div className="glass-panel stack-md">
        <h2>Search Events</h2>

        <input
          className="input"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, city, or category..."
          type="text"
          value={search}
        />

        <div className="grid-two">
          <CustomSelect options={cityOptions} value={city} onChange={setCity} />
          <CustomSelect options={categoryOptions} value={category} onChange={setCategory} />
        </div>

        {filteredEvents.length === 0 ? (
          <p>No events found. Try a different search or filter.</p>
        ) : (
          <p>{filteredEvents.length} event{filteredEvents.length > 1 ? "s" : ""} found</p>
        )}

        <div className="stack-md">
          {filteredEvents.map((event) => (
            <div className="glass-panel stack-sm" key={event.id}>
              <h3>{event.title}</h3>
              <p>{event.city} • {event.category}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
