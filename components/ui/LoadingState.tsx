import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingStateProps {
  label?: string;
  variant?: "spinner" | "skeleton";
  lines?: number;
  className?: string;
}

export function LoadingState({ label = "Loading…", variant = "spinner", lines = 3, className }: LoadingStateProps) {
  if (variant === "skeleton") {
    return (
      <div role="status" aria-label={label} className={cn("flex flex-col gap-2.5", className)}>
        <span className="sr-only">{label}</span>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="skeleton h-4 w-full" style={{ width: `${100 - i * 12}%` }} aria-hidden="true" />
        ))}
      </div>
    );
  }
  return (
    <div role="status" className={cn("flex items-center justify-center gap-2.5 py-10", className)}>
      <Loader2 className="h-5 w-5 animate-spin text-[var(--r-primary)]" aria-hidden="true" />
      <span className="type-small font-medium text-ink-muted">{label}</span>
    </div>
  );
}
