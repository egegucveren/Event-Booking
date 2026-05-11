// Field wrapper: keeps labels, hints, and validation messages aligned for form inputs.
import type { ReactNode } from "react";

type FieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  errors?: string[];
  children: ReactNode;
};

export function Field({ label, htmlFor, hint, errors, children }: FieldProps) {
  return (
    <label className="field" htmlFor={htmlFor}>
      <span className="field__label">{label}</span>
      {children}
      {hint ? <span className="field__hint">{hint}</span> : null}
      {errors?.map((error) => (
        <span className="field__error" key={error}>
          {error}
        </span>
      ))}
    </label>
  );
}
