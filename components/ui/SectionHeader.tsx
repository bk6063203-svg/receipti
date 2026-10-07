import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  /** Heading id for aria-labelledby section labelling. */
  id?: string;
  /** Use "dark" on dark (#171717) surfaces for correct contrast. */
  tone?: "light" | "dark";
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  id,
  tone = "light",
}: SectionHeaderProps) {
  const dark = tone === "dark";
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className={cn("type-label", dark ? "text-[var(--r-accent)]" : "text-[var(--r-primary)]")}>
          {eyebrow}
        </p>
      )}
      <h2 id={id} className={cn("type-h2 mt-2", dark && "text-[var(--r-on-dark)]")}>
        {title}
      </h2>
      {description && (
        <p className={cn("type-body mt-3", dark ? "text-[var(--r-on-dark-muted)]" : "text-ink-muted")}>
          {description}
        </p>
      )}
    </div>
  );
}
