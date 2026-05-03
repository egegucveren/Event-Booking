"use client";

import { useActionState } from "react";

import { registerAction } from "@/actions/auth";
import { Field } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { idleFormState } from "@/lib/validation";

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, idleFormState);

  return (
    <form action={formAction} className="stack-lg">
      <Field errors={state.fieldErrors?.name} htmlFor="name" label="Full name">
        <input className="input" id="name" name="name" placeholder="Ava Morgan" type="text" />
      </Field>

      <Field errors={state.fieldErrors?.email} htmlFor="email" label="Email address">
        <input className="input" id="email" name="email" placeholder="ava@example.com" type="email" />
      </Field>

      <Field errors={state.fieldErrors?.password} htmlFor="password" label="Password" hint="Use at least 8 characters.">
        <input className="input" id="password" name="password" placeholder="Create a strong password" type="password" />
      </Field>

      <Field errors={state.fieldErrors?.role} htmlFor="role" label="Primary role">
        <select className="input" defaultValue="attendee" id="role" name="role">
          <option value="attendee">Attendee</option>
          <option value="organiser">Organiser</option>
        </select>
      </Field>

      {state.message ? <p className="form-message form-message--error">{state.message}</p> : null}

      <SubmitButton label="Create Account" pendingLabel="Creating account..." />
    </form>
  );
}
