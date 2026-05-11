import { type NextRequest, NextResponse } from "next/server";

import { execute } from "@/lib/db";
import { contactSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  await execute(
    "INSERT INTO contact_tickets (name, email, message, status) VALUES (?, ?, ?, 'open')",
    [parsed.data.name, parsed.data.email, parsed.data.message]
  );

  return NextResponse.json({ success: true }, { status: 201 });
}
