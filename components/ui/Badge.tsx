import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "primary" | "success" | "danger" | "warning" | "info" | "dark";

const TONES: Record<Tone, string> = {
  neutral: "bg-[var(--r-neutral-muted)] text-ink-muted",
  primary: "bg-[var(--r-primary-muted)] text-[var(--r-primary)]",
  success: "bg-[var(--r-verified-muted)] text-[var(--r-verified)]",
  danger: "bg-[var(--r-danger-muted)] text-[var(--r-danger)]",
  warning: "bg-[var(--r-warning-muted)] text-[var(--r-warning)]",
  info: "bg-[var(--r-info-muted)] text-[var(--r-info)]",
  dark: "bg-[var(--r-dark)] text-[var(--r-on-dark)]",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  dot?: boolean;
}

/** Generic label badge. For domain states use StatusBadge instead. */
export function Badge({ tone = "neutral", dot = false, className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 type-caption font-semibold",
        TONES[tone],
        className
      )}
      {...rest}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}
