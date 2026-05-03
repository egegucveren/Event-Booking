"use client";

import { useActionState } from "react";

import { createBookingAction } from "@/actions/bookings";
import { Field } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { idleFormState } from "@/lib/validation";

type BookingFormProps = {
  eventId: number;
};

export function BookingForm({ eventId }: BookingFormProps) {
  const [state, formAction] = useActionState(createBookingAction, idleFormState);

  return (
    <form action={formAction} className="stack-md">
      <input name="eventId" type="hidden" value={eventId} />

      <Field errors={state.fieldErrors?.seats} htmlFor="seats" label="Seats" hint="Reserve up to 6 seats in one order.">
        <input className="input" defaultValue="1" id="seats" max="6" min="1" name="seats" step="1" type="number" />
      </Field>

      {state.message ? <p className="form-message form-message--error">{state.message}</p> : null}

      <SubmitButton label="Confirm Booking" pendingLabel="Confirming..." />
    </form>
  );
}
