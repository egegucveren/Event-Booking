import { type NextRequest, NextResponse } from "next/server";

import { getFeaturedEvents } from "@/lib/queries";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category") ?? undefined;
  const city = searchParams.get("city") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const rawLimit = Number(searchParams.get("limit") ?? "12");
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 50) : 12;

  const events = await getFeaturedEvents({ category, city, search, limit });
  return NextResponse.json({ events });
}
