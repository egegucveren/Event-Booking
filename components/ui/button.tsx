import { classNames } from "@/lib/format";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "md" | "sm";

const variantMap: Record<ButtonVariant, string> = {
  primary: "button button--primary",
  secondary: "button button--secondary",
  ghost: "button button--ghost",
  danger: "button button--danger"
};

const sizeMap: Record<ButtonSize, string> = {
  md: "button--md",
  sm: "button--sm"
};

export function buttonClassName(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra?: string) {
  return classNames(variantMap[variant], sizeMap[size], extra);
}
