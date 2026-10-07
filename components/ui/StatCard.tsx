import * as React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "./Card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  hint?: string;
  trend?: { direction: "up" | "down"; value: string; positive?: boolean };
  className?: string;
}

export function StatCard({ label, value, icon, hint, trend, className }: StatCardProps) {
  const TrendIcon = trend?.direction === "up" ? TrendingUp : TrendingDown;
  const good = trend ? (trend.positive ?? trend.direction === "up") : undefined;
  return (
    <Card padding="md" className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="type-label text-ink-muted">{label}</p>
        {icon && <span className="text-ink-faint">{icon}</span>}
      </div>
      <p className="type-h2 type-amount" data-numeric>
        {value}
      </p>
      {(hint || trend) && (
        <div className="flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 type-caption font-semibold",
                good
                  ? "bg-[var(--r-verified-muted)] text-[var(--r-verified)]"
                  : "bg-[var(--r-danger-muted)] text-[var(--r-danger)]"
              )}
            >
              <TrendIcon className="h-3 w-3" aria-hidden="true" />
              {trend.value}
            </span>
          )}
          {hint && <p className="type-caption text-ink-muted">{hint}</p>}
        </div>
      )}
    </Card>
  );
}
