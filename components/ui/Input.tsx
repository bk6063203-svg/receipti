"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leftAddon, rightAddon, className, id, required, ...rest },
  ref
) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="type-label mb-1.5 block text-ink-muted">
          {label}
          {required && (
            <span className="ml-1 text-[var(--r-danger)]" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <div
        className={cn(
          "flex h-10 items-center gap-2 rounded-lg border bg-[var(--r-card)] px-3 transition-colors",
          "focus-within:border-[var(--r-primary)] focus-within:ring-2 focus-within:ring-[var(--r-primary-muted)]",
          error ? "border-[var(--r-danger)]" : "border-line",
          className
        )}
      >
        {leftAddon && <span className="shrink-0 text-ink-faint">{leftAddon}</span>}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          className="h-full w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint disabled:opacity-50"
          {...rest}
        />
        {rightAddon && <span className="shrink-0 text-ink-faint">{rightAddon}</span>}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="type-caption mt-1.5 font-medium text-[var(--r-danger)]">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="type-caption mt-1.5 text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
