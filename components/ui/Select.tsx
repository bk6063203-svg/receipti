"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, options, placeholder, className, id, required, ...rest },
  ref
) {
  const autoId = React.useId();
  const selectId = id ?? autoId;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="type-label mb-1.5 block text-ink-muted">
          {label}
          {required && (
            <span className="ml-1 text-[var(--r-danger)]" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          className={cn(
            "h-10 w-full appearance-none rounded-lg border bg-[var(--r-card)] pl-3 pr-9 text-sm text-ink outline-none transition-colors",
            "focus:border-[var(--r-primary)] focus:ring-2 focus:ring-[var(--r-primary-muted)]",
            "disabled:opacity-50",
            error ? "border-[var(--r-danger)]" : "border-line",
            className
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
          aria-hidden="true"
        />
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
