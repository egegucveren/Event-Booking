"use client";

import { useActionState } from "react";

import { loginAction } from "@/actions/auth";
import { Field } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { idleFormState } from "@/lib/validation";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, idleFormState);

  return (
    <form action={formAction} className="stack-lg">
      <Field errors={state.fieldErrors?.email} htmlFor="email" label="Email address">
        <input className="input" id="email" name="email" placeholder="you@example.com" type="email" />
      </Field>

      <Field errors={state.fieldErrors?.password} htmlFor="password" label="Password">
        <input className="input" id="password" name="password" placeholder="Enter your password" type="password" />
      </Field>

      {state.message ? <p className="form-message form-message--error">{state.message}</p> : null}

      <SubmitButton label="Log In" pendingLabel="Logging you in..." />
    </form>
  );
}
