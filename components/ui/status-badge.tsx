// Status badge: renders compact labels for roles, statuses, and highlighted states.
import { classNames } from "@/lib/format";

type StatusBadgeProps = {
  label: string;
  tone?: "default" | "success" | "warning";
};

export function StatusBadge({ label, tone = "default" }: StatusBadgeProps) {
  return <span className={classNames("status-badge", `status-badge--${tone}`)}>{label}</span>;
}
