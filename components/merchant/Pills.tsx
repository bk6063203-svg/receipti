"use client";

import { AlertTriangle, Check, CircleDashed, Clock, Eye, SearchX, ShieldCheck } from "lucide-react";
import { TransactionStatusBadge } from "@/components/ui";
import type { ReceiptTxState } from "@/types/pos";
import type { DeliveryInfo, VerificationResult } from "@/types/merchant";
import { cn } from "@/lib/utils";

/** Transaction pill with the partial state the generic badge omits. */
export function TxPill({ state }: { state: ReceiptTxState }) {
  if (state === "PARTIALLY_REFUNDED") {
    return (
      <span className="type-status inline-flex items-center gap-1.5 rounded-full bg-[var(--r-warning-muted)] px-2.5 py-1 text-[var(--r-warning)]">
        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
        Partially refunded
      </span>
    );
  }
  return <TransactionStatusBadge status={state} />;
}

const DELIVERY_META = {
  DELIVERED: { label: "Delivered", icon: Check, cls: "bg-[var(--r-verified-muted)] text-[var(--r-verified)]" },
  VIEWED: { label: "Viewed", icon: Eye, cls: "bg-[var(--r-info-muted)] text-[var(--r-info)]" },
  PENDING: { label: "Pending", icon: Clock, cls: "bg-[var(--r-warning-muted)] text-[var(--r-warning)]" },
  UNAVAILABLE: { label: "Unavailable", icon: CircleDashed, cls: "bg-[var(--r-neutral-muted)] text-ink-muted" },
} as const;

export function DeliveryPill({ delivery }: { delivery: DeliveryInfo }) {
  const meta = DELIVERY_META[delivery.status];
  const Icon = meta.icon;
  return (
    <span className={cn("type-status inline-flex items-center gap-1.5 rounded-full px-2.5 py-1", meta.cls)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {meta.label}
      {delivery.method ? <span aria-label={`via ${delivery.method}`}>· {delivery.method}</span> : null}
    </span>
  );
}

const RESULT_META: Record<VerificationResult, { label: string; icon: typeof Check; cls: string }> = {
  VERIFIED: { label: "Verified", icon: ShieldCheck, cls: "bg-[var(--r-verified-muted)] text-[var(--r-verified)]" },
  MISMATCH: { label: "Mismatch detected", icon: AlertTriangle, cls: "bg-[var(--r-warning-muted)] text-[var(--r-warning)]" },
  NOT_FOUND: { label: "Not found", icon: SearchX, cls: "bg-[var(--r-neutral-muted)] text-ink-muted" },
  UNAVAILABLE: { label: "Unavailable", icon: CircleDashed, cls: "bg-[var(--r-neutral-muted)] text-ink-muted" },
};

export function VerifyResultPill({ result }: { result: VerificationResult }) {
  const meta = RESULT_META[result];
  const Icon = meta.icon;
  return (
    <span className={cn("type-status inline-flex items-center gap-1.5 rounded-full px-2.5 py-1", meta.cls)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  );
}
