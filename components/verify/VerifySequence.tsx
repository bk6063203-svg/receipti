"use client";

import { Check, Loader2 } from "lucide-react";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";

export const VERIFY_STEPS = [
  "Receipt reference received",
  "Finding Receipti record",
  "Comparing transaction data",
  "Verification complete",
] as const;

export function VerifySequence({ activeIndex }: { activeIndex: number }) {
  return (
    <Card
      role="status"
      aria-live="polite"
      aria-label={VERIFY_STEPS[Math.min(activeIndex, VERIFY_STEPS.length - 1)]}
      className="mx-auto w-full max-w-md"
    >
      <p className="type-h3 text-center">Verifying receipt…</p>
      <ol className="mt-5 space-y-2.5">
        {VERIFY_STEPS.map((label, i) => {
          const done = i < activeIndex;
          const active = i === activeIndex;
          return (
            <li
              key={label}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-2.5",
                done || active
                  ? "border-[var(--r-primary)] bg-[var(--r-primary-muted)]/40"
                  : "border-line opacity-45"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  done
                    ? "bg-[var(--r-primary)] text-white"
                    : active
                      ? "bg-[var(--r-card)] text-[var(--r-primary)]"
                      : "bg-background text-ink-faint"
                )}
              >
                {done ? (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                ) : active ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                )}
              </span>
              <span className="text-sm font-medium">{label}</span>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
