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
  const [city, setCity] = useState("all");
  const [category, setCategory] = useState("all");

  const cities = Array.from(new Set(events.map((event) => event.city).filter(Boolean)));
  const categories = Array.from(new Set(events.map((event) => event.category).filter(Boolean)));

  const filteredEvents = events.filter((event) => {
    const text = `${event.title} ${event.city ?? ""} ${event.category ?? ""}`.toLowerCase();

    const matchesSearch = text.includes(search.toLowerCase());
    const matchesCity = city === "all" || event.city === city;
    const matchesCategory = category === "all" || event.category === category;

    return matchesSearch && matchesCity && matchesCategory;
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

        <div className="grid two-columns">
          <select className="input" value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="all">All cities</option>
            {cities.map((cityName) => (
              <option key={cityName} value={cityName}>
                {cityName}
              </option>
            ))}
          </select>

          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All categories</option>
            {categories.map((categoryName) => (
              <option key={categoryName} value={categoryName}>
                {categoryName}
              </option>
            ))}
          </select>
        </div>

        <p>{filteredEvents.length} event found</p>
      </div>
    </section>
  );
}