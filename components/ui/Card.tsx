import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** Semantic element to render. */
  as?: "div" | "article" | "section";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const PADDING = {
  none: "p-0",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "card-pad",
} as const;

export function Card({ as = "div", padding = "md", hover = false, className, ...rest }: CardProps) {
  const Tag = as;
  return (
    <Tag
      className={cn(
        "surface-card",
        PADDING[padding],
        hover && "transition-shadow duration-200 hover:shadow-card",
        className
      )}
      {...rest}
    />
  );
}

export function CardHeader({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4 flex items-start justify-between gap-4", className)} {...rest} />;
}

export function CardTitle({ className, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("type-h3", className)} {...rest} />;
}

export function CardDescription({ className, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("type-small mt-1 text-ink-muted", className)} {...rest} />;
}

export function CardFooter({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mt-5 flex items-center gap-3 border-t border-line pt-4", className)} {...rest} />
  );
}
