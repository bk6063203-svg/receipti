"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "dark";
type Size = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-[var(--r-primary)] text-white hover:bg-[var(--r-primary-hover)] active:bg-[var(--r-primary-active)] shadow-subtle",
  secondary:
    "bg-[var(--r-primary-muted)] text-[var(--r-primary)] hover:bg-[#d8ece3] active:bg-[#c9e4d8]",
  outline:
    "bg-[var(--r-card)] text-ink border border-line hover:border-ink-faint hover:bg-background active:bg-[#efefec]",
  ghost: "text-ink-muted hover:text-ink hover:bg-background active:bg-[#efefec]",
  danger: "bg-[var(--r-danger)] text-white hover:brightness-95 active:brightness-90",
  dark: "bg-[var(--r-dark)] text-[var(--r-on-dark)] hover:bg-[var(--r-dark-raised)] active:bg-black",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[0.8125rem] gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-[0.9375rem] gap-2",
  icon: "h-10 w-10",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    leftIcon,
    rightIcon,
    className,
    disabled,
    children,
    type = "button",
    ...rest
  },
  ref
) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex select-none items-center justify-center whitespace-nowrap rounded-lg font-medium",
        "transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
});
