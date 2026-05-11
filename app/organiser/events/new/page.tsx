// Organiser creation page: protects event publishing and renders the shared event editor.
import Link from "next/link";

import { createEventAction } from "@/actions/events";
import { EventEditorForm } from "@/components/forms/event-editor-form";
import { buttonClassName } from "@/components/ui/button";
import { requireRole } from "@/lib/auth";

export default async function NewEventPage() {
  await requireRole("organiser");

  return (
    <section className="section stack-xl">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Create event</p>
          <h1>Publish a new listing with validated details and a clear attendee offer.</h1>
          <p>This form writes directly to MySQL through a protected server action and validates all critical fields before saving.</p>
        </div>
        <Link className={buttonClassName("ghost")} href="/organiser">
          Back to Dashboard
        </Link>
      </div>

      <div className="glass-panel">
        <EventEditorForm action={createEventAction} submitLabel="Publish Event" />
      </div>
    </section>
  );
}
