"use client";

// Contact form: sends visitor messages and shows inline validation or success feedback.
import { useActionState } from "react";

import { submitContactAction } from "@/actions/contact";
import { SubmitButton } from "@/components/ui/submit-button";
import { idleFormState } from "@/lib/validation";

export function ContactForm() {
  const [state, formAction] = useActionState(submitContactAction, idleFormState);

  if (state.status === "success") {
    return (
      <div className="notice-banner notice-banner--success">
        <strong>Message sent</strong>
        <p>{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="stack-sm">
      <label className="field" htmlFor="contact-name">
        <span className="field__label">Your name</span>
        <input
          autoComplete="name"
          className="input"
          id="contact-name"
          name="name"
          placeholder="Jane Smith"
          type="text"
        />
        {state.fieldErrors?.name ? (
          <span className="field__error">{state.fieldErrors.name[0]}</span>
        ) : null}
      </label>

      <label className="field" htmlFor="contact-email">
        <span className="field__label">Email address</span>
        <input
          autoComplete="email"
          className="input"
          id="contact-email"
          name="email"
          placeholder="jane@example.com"
          type="email"
        />
        {state.fieldErrors?.email ? (
          <span className="field__error">{state.fieldErrors.email[0]}</span>
        ) : null}
      </label>

      <label className="field" htmlFor="contact-message">
        <span className="field__label">Message</span>
        <textarea
          className="input contact-textarea"
          id="contact-message"
          name="message"
          placeholder="How can we help you?"
          rows={5}
        />
        {state.fieldErrors?.message ? (
          <span className="field__error">{state.fieldErrors.message[0]}</span>
        ) : null}
      </label>

      {state.status === "error" && state.message && !state.fieldErrors ? (
        <p className="form-message form-message--error">{state.message}</p>
      ) : null}

      <SubmitButton label="Send Message" pendingLabel="Sending..." />
    </form>
  );
}
