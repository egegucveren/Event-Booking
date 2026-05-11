import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { getAttendeeBookings } from "@/lib/queries";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (user.role !== "attendee") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const bookings = await getAttendeeBookings(user.id);
  return NextResponse.json({ bookings });
}
