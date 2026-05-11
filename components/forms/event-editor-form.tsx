"use client";

// Shared event editor: powers both organiser create and edit flows with one validated form.
import { useActionState } from "react";

import { Field } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { EditableEvent, FormState } from "@/lib/types";
import { categories, idleFormState } from "@/lib/validation";

type EventEditorFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  event?: EditableEvent | null;
  submitLabel: string;
};

export function EventEditorForm({ action, event, submitLabel }: EventEditorFormProps) {
  const [state, formAction] = useActionState(action, idleFormState);

  return (
    <form action={formAction} className="stack-xl">
      {event ? <input name="eventId" type="hidden" value={event.id} /> : null}

      <div className="grid-two">
        <Field errors={state.fieldErrors?.title} htmlFor="title" label="Event title">
          <input className="input" defaultValue={event?.title} id="title" name="title" placeholder="Neon Rooftop Session" type="text" />
        </Field>

        <Field errors={state.fieldErrors?.category} htmlFor="category" label="Category">
          <select className="input" defaultValue={event?.category ?? "Music"} id="category" name="category">
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>

        <Field errors={state.fieldErrors?.city} htmlFor="city" label="City">
          <input className="input" defaultValue={event?.city} id="city" name="city" placeholder="Dublin" type="text" />
        </Field>

        <Field errors={state.fieldErrors?.venue} htmlFor="venue" label="Venue">
          <input className="input" defaultValue={event?.venue} id="venue" name="venue" placeholder="Harbour Deck" type="text" />
        </Field>

        <Field errors={state.fieldErrors?.startsAt} htmlFor="startsAt" label="Starts at">
          <input className="input" defaultValue={event?.startsAtInput} id="startsAt" name="startsAt" type="datetime-local" />
        </Field>

        <Field errors={state.fieldErrors?.endsAt} htmlFor="endsAt" label="Ends at">
          <input className="input" defaultValue={event?.endsAtInput} id="endsAt" name="endsAt" type="datetime-local" />
        </Field>

        <Field errors={state.fieldErrors?.price} htmlFor="price" label="Ticket price (EUR)">
          <input className="input" defaultValue={event?.price} id="price" min="0" name="price" placeholder="49.00" step="0.01" type="number" />
        </Field>

        <Field errors={state.fieldErrors?.capacity} htmlFor="capacity" label="Capacity">
          <input className="input" defaultValue={event?.capacity} id="capacity" min="1" name="capacity" placeholder="120" step="1" type="number" />
        </Field>
      </div>

      <Field errors={state.fieldErrors?.excerpt} htmlFor="excerpt" label="Short summary">
        <textarea className="input input--textarea" defaultValue={event?.excerpt} id="excerpt" name="excerpt" placeholder="A sharp one-line event pitch for cards and previews." />
      </Field>

      <Field errors={state.fieldErrors?.description} htmlFor="description" label="Full description">
        <textarea
          className="input input--textarea input--textarea-lg"
          defaultValue={event?.description}
          id="description"
          name="description"
          placeholder="Describe the attendee experience, what is included, and why this event matters."
        />
      </Field>

      <Field errors={state.fieldErrors?.status} htmlFor="status" label="Status">
        <select className="input" defaultValue={event?.status ?? "scheduled"} id="status" name="status">
          <option value="scheduled">Scheduled</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </Field>

      {state.message ? <p className="form-message form-message--error">{state.message}</p> : null}

      <div className="row gap-sm">
        <SubmitButton label={submitLabel} pendingLabel="Saving event..." />
      </div>
    </form>
  );
}
