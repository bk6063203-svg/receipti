import { AlertTriangle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import type { PosRefundStatus } from "@/types/pos";
import { cn } from "@/lib/utils";

const CONFIG: Record<PosRefundStatus, { label: string; classes: string; icon: React.ComponentType<{ className?: string }> ; spin?: boolean }> = {
  PENDING: {
    label: "Pending",
    classes: "bg-[var(--r-neutral-muted)] text-ink-muted",
    icon: Clock,
  },
  PROCESSING: {
    label: "Processing",
    classes: "bg-[var(--r-info-muted)] text-[var(--r-info)]",
    icon: Loader2,
    spin: true,
  },
  COMPLETED: {
    label: "Completed",
    classes: "bg-[var(--r-verified-muted)] text-[var(--r-verified)]",
    icon: CheckCircle2,
  },
  FAILED: {
    label: "Failed",
    classes: "bg-[var(--r-danger-muted)] text-[var(--r-danger)]",
    icon: AlertTriangle,
  },
};

/** Refund-event status — always icon + text, never color alone. */
export function RefundStatusPill({ status }: { status: PosRefundStatus }) {
  const c = CONFIG[status];
  const Icon = c.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 type-status", c.classes)}>
      <Icon className={cn("h-3.5 w-3.5", c.spin && "animate-spin")} aria-hidden="true" />
      {c.label}
    </span>
  );
}
