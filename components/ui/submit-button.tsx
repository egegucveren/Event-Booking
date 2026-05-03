"use client";

import { useFormStatus } from "react-dom";

import { buttonClassName } from "@/components/ui/button";

type SubmitButtonProps = {
  label: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "sm";
};

export function SubmitButton({
  label,
  pendingLabel = "Working...",
  variant = "primary",
  size = "md"
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button className={buttonClassName(variant, size)} disabled={pending} type="submit">
      {pending ? pendingLabel : label}
    </button>
  );
}
