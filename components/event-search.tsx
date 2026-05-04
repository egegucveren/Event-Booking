"use client";

import { useState } from "react";

type EventSearchProps = {
  events: {
    id: number;
    title: string;
    city?: string;
    category?: string;
  }[];
};

export function EventSearch({ events }: EventSearchProps) {
  const [search, setSearch] = useState("");

  const filteredEvents = events.filter((event) => {
    const text = `${event.title} ${event.city ?? ""} ${event.category ?? ""}`;
    return text.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <section className="section section--tight">
      <div className="glass-panel stack-md">
        <h2>Search Events</h2>

        <input
          type="text"
          placeholder="Search by title, city, or category..."
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <p>{filteredEvents.length} event found</p>
      </div>
    </section>
  );
}