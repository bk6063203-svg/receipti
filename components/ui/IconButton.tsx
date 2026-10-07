"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "outline" | "dark";
}

const SIZES = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-12 w-12" } as const;
const VARIANTS = {
  ghost: "text-ink-muted hover:text-ink hover:bg-background",
  outline: "bg-[var(--r-card)] text-ink border border-line hover:bg-background",
  dark: "bg-[var(--r-dark)] text-[var(--r-on-dark)] hover:bg-[var(--r-dark-raised)]",
} as const;

/** Icon-only button — always needs an accessible `label`. */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ label, size = "md", variant = "ghost", className, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-lg transition-colors duration-150",
          "disabled:pointer-events-none disabled:opacity-50",
          SIZES[size],
          VARIANTS[variant],
          className
        )}
        {...rest}
      />
    );
  }
);
