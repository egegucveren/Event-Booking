// Organiser edit page: loads one owned event and reuses the shared editor form.
import Link from "next/link";
import { notFound } from "next/navigation";

import { updateEventAction } from "@/actions/events";
import { EventEditorForm } from "@/components/forms/event-editor-form";
import { buttonClassName } from "@/components/ui/button";
import { requireRole } from "@/lib/auth";
import { getEditableEventForOrganiser } from "@/lib/queries";

type EditEventProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditEventPage({ params }: EditEventProps) {
  const organiser = await requireRole("organiser");
  const { id } = await params;
  const event = await getEditableEventForOrganiser(organiser.id, Number(id));

  if (!event) {
    notFound();
  }

  return (
    <section className="section stack-xl">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Edit event</p>
          <h1>Refine the experience without losing ownership or data integrity.</h1>
          <p>Only the organiser who owns the event can access this form.</p>
        </div>
        <Link className={buttonClassName("ghost")} href="/organiser">
          Back to Dashboard
        </Link>
      </div>

      <div className="glass-panel">
        <EventEditorForm action={updateEventAction} event={event} submitLabel="Save Changes" />
      </div>
    </section>
  );
}
