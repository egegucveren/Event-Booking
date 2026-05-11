// Empty state: keeps fallback screens consistent with optional call-to-action support.
import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";

type EmptyStateProps = {
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function EmptyState({ title, body, ctaLabel, ctaHref }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <p className="eyebrow">Ready for the next step</p>
      <h3>{title}</h3>
      <p>{body}</p>
      {ctaHref && ctaLabel ? (
        <Link className={buttonClassName("secondary")} href={ctaHref}>
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
