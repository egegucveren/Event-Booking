"use client";

// Booking form: submits attendee seat reservations and warns when the seat cap is exceeded.
import Link from "next/link";
import { useState } from "react";
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
  const [seats, setSeats] = useState(1);

  const overLimit = seats > 6;

  return (
    <form action={formAction} className="stack-md">
      <input name="eventId" type="hidden" value={eventId} />

      <Field errors={state.fieldErrors?.seats} htmlFor="seats" label="Seats" hint="Reserve up to 6 seats in one order.">
        <input
          className="input"
          id="seats"
          min="1"
          name="seats"
          step="1"
          type="number"
          value={seats}
          onChange={(e) => setSeats(Number(e.target.value))}
        />
      </Field>

      {overLimit ? (
        <div className="over-limit-hint">
          <p>
            Need more than 6 seats?{" "}
            <Link href="/contact" className="over-limit-hint__link">
              Contact us
            </Link>{" "}
            and we will arrange group bookings for you.
          </p>
        </div>
      ) : null}

      {state.message ? (
        <p className="form-message form-message--error">
          {state.message}{" "}
          {state.message.includes("e-ticket card") ? (
            <Link href="/e-ticket" className="over-limit-hint__link">
              Open card page
            </Link>
          ) : null}
        </p>
      ) : null}

      <SubmitButton disabled={overLimit} label="Confirm Booking" pendingLabel="Confirming..." />
    </form>
  );
}
