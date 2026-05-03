export type Role = "admin" | "organiser" | "attendee";

export type EventStatus = "scheduled" | "cancelled";

export type BookingStatus = "confirmed" | "cancelled";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

export type EventCardData = {
  id: number;
  title: string;
  category: string;
  imagePath: string;
  imagePosition: {
    compact: string;
    showcase: string;
    detail: string;
  };
  imageSize: {
    compact: string;
    showcase: string;
    detail: string;
  };
  venue: string;
  city: string;
  startsAt: string;
  endsAt: string;
  priceCents: number;
  capacity: number;
  excerpt: string;
  description: string;
  status: EventStatus;
  organiserName: string;
  bookedSeats: number;
  remainingSeats: number;
};

export type EditableEvent = {
  id: number;
  title: string;
  category: string;
  venue: string;
  city: string;
  startsAtInput: string;
  endsAtInput: string;
  price: string;
  capacity: string;
  excerpt: string;
  description: string;
  status: EventStatus;
};

export type BookingRecord = {
  id: number;
  code: string;
  eventId: number;
  eventTitle: string;
  city: string;
  venue: string;
  startsAt: string;
  seats: number;
  totalCents: number;
  status: BookingStatus;
};

export type DashboardStats = {
  totalEvents: number;
  totalBookings: number;
  totalCities: number;
};

export type FormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};
