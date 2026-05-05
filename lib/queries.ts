import type { RowDataPacket } from "mysql2";

import { query } from "@/lib/db";
import { getEventVisual } from "@/lib/event-visuals";
import type { BookingRecord, ContactTicket, DashboardStats, EditableEvent, EventCardData, Role } from "@/lib/types";

type EventRow = RowDataPacket & {
  id: number;
  title: string;
  category: string;
  venue: string;
  city: string;
  startsAt: string;
  endsAt: string;
  priceCents: number;
  capacity: number;
  excerpt: string;
  description: string;
  status: "scheduled" | "cancelled";
  organiserName: string;
  bookedSeats: number | null;
};

type EditableEventRow = RowDataPacket & {
  id: number;
  title: string;
  category: string;
  venue: string;
  city: string;
  startsAtInput: string;
  endsAtInput: string;
  priceCents: number;
  capacity: number;
  excerpt: string;
  description: string;
  status: "scheduled" | "cancelled";
};

type StatsRow = RowDataPacket & {
  totalEvents: number;
  totalBookings: number;
  totalCities: number;
};

type RoleStatsRow = RowDataPacket & {
  liveEvents: number;
  totalBookings: number;
  seatsSold: number;
  revenueCents: number;
};

type BookingRow = RowDataPacket & {
  id: number;
  code: string;
  eventId: number;
  eventTitle: string;
  city: string;
  venue: string;
  startsAt: string;
  seats: number;
  totalCents: number;
  status: "confirmed" | "cancelled";
};

type AdminUserRow = RowDataPacket & {
  id: number;
  name: string;
  email: string;
  role: Role;
  isOwner: number;
  createdAt: string;
  eventsCreated: number;
  bookingsMade: number;
};

type AdminEventRow = RowDataPacket & {
  id: number;
  title: string;
  organiserName: string;
  startsAt: string;
  city: string;
  status: "scheduled" | "cancelled";
  bookedSeats: number | null;
};

function mapEvent(row: EventRow): EventCardData {
  const bookedSeats = Number(row.bookedSeats ?? 0);
  const visual = getEventVisual(row.title, row.category);

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    imagePath: visual.imagePath,
    imagePosition: visual.imagePosition,
    imageSize: visual.imageSize,
    venue: row.venue,
    city: row.city,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    priceCents: row.priceCents,
    capacity: row.capacity,
    excerpt: row.excerpt,
    description: row.description,
    status: row.status,
    organiserName: row.organiserName,
    bookedSeats,
    remainingSeats: Math.max(row.capacity - bookedSeats, 0)
  };
}

export async function getLandingStats() {
  const rows = await query<StatsRow[]>(
    `
      SELECT
        (SELECT COUNT(*) FROM events) AS totalEvents,
        (SELECT COALESCE(SUM(seats), 0) FROM bookings WHERE status = 'confirmed') AS totalBookings,
        (SELECT COUNT(DISTINCT city) FROM events) AS totalCities
    `
  );

  const row = rows[0];
  return {
    totalEvents: Number(row?.totalEvents ?? 0),
    totalBookings: Number(row?.totalBookings ?? 0),
    totalCities: Number(row?.totalCities ?? 0)
  } satisfies DashboardStats;
}

export async function getFeaturedEvents(limit = 6) {
  const rows = await query<EventRow[]>(
    `
      SELECT
        e.id,
        e.title,
        e.category,
        e.venue,
        e.city,
        e.starts_at AS startsAt,
        e.ends_at AS endsAt,
        e.price_cents AS priceCents,
        e.capacity,
        e.excerpt,
        e.description,
        e.status,
        u.name AS organiserName,
        COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.seats ELSE 0 END), 0) AS bookedSeats
      FROM events e
      INNER JOIN users u ON u.id = e.organiser_id
      LEFT JOIN bookings b ON b.event_id = e.id
      WHERE e.starts_at >= NOW()
        AND e.status = 'scheduled'
      GROUP BY e.id
      ORDER BY e.starts_at ASC
      LIMIT ?
    `,
    [limit]
  );

  return rows.map(mapEvent);
}

export async function getEventById(eventId: number) {
  const rows = await query<EventRow[]>(
    `
      SELECT
        e.id,
        e.title,
        e.category,
        e.venue,
        e.city,
        e.starts_at AS startsAt,
        e.ends_at AS endsAt,
        e.price_cents AS priceCents,
        e.capacity,
        e.excerpt,
        e.description,
        e.status,
        u.name AS organiserName,
        COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.seats ELSE 0 END), 0) AS bookedSeats
      FROM events e
      INNER JOIN users u ON u.id = e.organiser_id
      LEFT JOIN bookings b ON b.event_id = e.id
      WHERE e.id = ?
      GROUP BY e.id
      LIMIT 1
    `,
    [eventId]
  );

  return rows[0] ? mapEvent(rows[0]) : null;
}

export async function getOrganiserEvents(organiserId: number) {
  const rows = await query<EventRow[]>(
    `
      SELECT
        e.id,
        e.title,
        e.category,
        e.venue,
        e.city,
        e.starts_at AS startsAt,
        e.ends_at AS endsAt,
        e.price_cents AS priceCents,
        e.capacity,
        e.excerpt,
        e.description,
        e.status,
        u.name AS organiserName,
        COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.seats ELSE 0 END), 0) AS bookedSeats
      FROM events e
      INNER JOIN users u ON u.id = e.organiser_id
      LEFT JOIN bookings b ON b.event_id = e.id
      WHERE e.organiser_id = ?
      GROUP BY e.id
      ORDER BY e.starts_at ASC
    `,
    [organiserId]
  );

  return rows.map(mapEvent);
}

export async function getOrganiserStats(organiserId: number) {
  const rows = await query<RoleStatsRow[]>(
    `
      SELECT
        COUNT(DISTINCT e.id) AS liveEvents,
        COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.id END) AS totalBookings,
        COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.seats ELSE 0 END), 0) AS seatsSold,
        COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.total_cents ELSE 0 END), 0) AS revenueCents
      FROM events e
      LEFT JOIN bookings b ON b.event_id = e.id
      WHERE e.organiser_id = ?
    `,
    [organiserId]
  );

  const row = rows[0];
  return {
    liveEvents: Number(row?.liveEvents ?? 0),
    totalBookings: Number(row?.totalBookings ?? 0),
    seatsSold: Number(row?.seatsSold ?? 0),
    revenueCents: Number(row?.revenueCents ?? 0)
  };
}

export async function getEditableEventForOrganiser(organiserId: number, eventId: number) {
  const rows = await query<EditableEventRow[]>(
    `
      SELECT
        id,
        title,
        category,
        venue,
        city,
        DATE_FORMAT(starts_at, '%Y-%m-%dT%H:%i') AS startsAtInput,
        DATE_FORMAT(ends_at, '%Y-%m-%dT%H:%i') AS endsAtInput,
        price_cents AS priceCents,
        capacity,
        excerpt,
        description,
        status
      FROM events
      WHERE id = ? AND organiser_id = ?
      LIMIT 1
    `,
    [eventId, organiserId]
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    venue: row.venue,
    city: row.city,
    startsAtInput: row.startsAtInput,
    endsAtInput: row.endsAtInput,
    price: (row.priceCents / 100).toFixed(2),
    capacity: String(row.capacity),
    excerpt: row.excerpt,
    description: row.description,
    status: row.status
  } satisfies EditableEvent;
}

export async function getAttendeeBookings(attendeeId: number) {
  const rows = await query<BookingRow[]>(
    `
      SELECT
        b.id,
        b.code,
        e.id AS eventId,
        e.title AS eventTitle,
        e.city,
        e.venue,
        e.starts_at AS startsAt,
        b.seats,
        b.total_cents AS totalCents,
        b.status
      FROM bookings b
      INNER JOIN events e ON e.id = b.event_id
      WHERE b.attendee_id = ?
      ORDER BY e.starts_at ASC
    `,
    [attendeeId]
  );

  return rows.map(
    (row) =>
      ({
        id: row.id,
        code: row.code,
        eventId: row.eventId,
        eventTitle: row.eventTitle,
        city: row.city,
        venue: row.venue,
        startsAt: row.startsAt,
        seats: row.seats,
        totalCents: row.totalCents,
        status: row.status
      }) satisfies BookingRecord
  );
}

export async function getAttendeeStats(attendeeId: number) {
  const rows = await query<RoleStatsRow[]>(
    `
      SELECT
        COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN e.id END) AS liveEvents,
        COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.id END) AS totalBookings,
        COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.seats ELSE 0 END), 0) AS seatsSold,
        COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.total_cents ELSE 0 END), 0) AS revenueCents
      FROM bookings b
      INNER JOIN events e ON e.id = b.event_id
      WHERE b.attendee_id = ?
    `,
    [attendeeId]
  );

  const row = rows[0];
  return {
    upcomingEvents: Number(row?.liveEvents ?? 0),
    totalBookings: Number(row?.totalBookings ?? 0),
    reservedSeats: Number(row?.seatsSold ?? 0),
    spendCents: Number(row?.revenueCents ?? 0)
  };
}

export async function getAdminUsers() {
  const rows = await query<AdminUserRow[]>(
    `
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.is_owner AS isOwner,
        u.created_at AS createdAt,
        COUNT(DISTINCT e.id) AS eventsCreated,
        COUNT(DISTINCT b.id) AS bookingsMade
      FROM users u
      LEFT JOIN events e ON e.organiser_id = u.id
      LEFT JOIN bookings b ON b.attendee_id = u.id
      GROUP BY u.id
      ORDER BY FIELD(u.role, 'admin', 'organiser', 'attendee'), u.created_at ASC
    `
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    isOwner: row.isOwner === 1,
    createdAt: row.createdAt,
    eventsCreated: Number(row.eventsCreated),
    bookingsMade: Number(row.bookingsMade)
  }));
}

export async function getOpenContactTickets(): Promise<ContactTicket[]> {
  type TicketRow = RowDataPacket & {
    id: number;
    name: string;
    email: string;
    message: string;
    status: "open" | "resolved";
    createdAt: string;
  };

  try {
    const rows = await query<TicketRow[]>(
      `SELECT id, name, email, message, status, created_at AS createdAt
       FROM contact_tickets
       ORDER BY FIELD(status, 'open', 'resolved'), created_at DESC`
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      message: row.message,
      status: row.status,
      createdAt: row.createdAt
    }));
  } catch {
    // Table does not exist yet — return empty until migration is run.
    return [];
  }
}

// Returns all events ordered by creation date for the admin event management panel.
export async function getAdminRecentEvents() {
  const rows = await query<AdminEventRow[]>(
    `
      SELECT
        e.id,
        e.title,
        u.name AS organiserName,
        e.starts_at AS startsAt,
        e.city,
        e.status,
        COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.seats ELSE 0 END), 0) AS bookedSeats
      FROM events e
      INNER JOIN users u ON u.id = e.organiser_id
      LEFT JOIN bookings b ON b.event_id = e.id
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    organiserName: row.organiserName,
    startsAt: row.startsAt,
    city: row.city,
    status: row.status,
    bookedSeats: Number(row.bookedSeats ?? 0)
  }));
}
