import { NextResponse } from "next/server";

import { getLandingStats } from "@/lib/queries";

export async function GET() {
  const stats = await getLandingStats();
  return NextResponse.json(stats);
}
