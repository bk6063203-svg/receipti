/* ============================================================
   RECEIPTI — Status metadata (Phase 01)
   Transaction status and verification status are INDEPENDENT
   systems. Never merge them into one badge.
   ============================================================ */
import type { TransactionStatus, VerificationStatus } from "@/types";
import { humanizeStatus } from "./format";

export interface StatusMeta {
  label: string;
  /** Tailwind classes for dot + pill (always paired with icon/text, never color-only). */
  pill: string;
  dot: string;
}

export const TRANSACTION_STATUS_META: Record<TransactionStatus, StatusMeta> = {
  PAID: {
    label: "Paid",
    pill: "bg-[var(--r-primary-muted)] text-[var(--r-primary)]",
    dot: "bg-[var(--r-primary)]",
  },
  PARTIALLY_PAID: {
    label: "Partially paid",
    pill: "bg-[var(--r-warning-muted)] text-[var(--r-warning)]",
    dot: "bg-[var(--r-warning)]",
  },
  REFUNDED: {
    label: "Refunded",
    pill: "bg-[var(--r-info-muted)] text-[var(--r-info)]",
    dot: "bg-[var(--r-info)]",
  },
  PENDING: {
    label: "Pending",
    pill: "bg-[var(--r-neutral-muted)] text-[var(--r-ink-muted)]",
    dot: "bg-[var(--r-ink-faint)]",
  },
  VOID: {
    label: "Void",
    pill: "bg-[var(--r-neutral-muted)] text-[var(--r-ink-muted)]",
    dot: "bg-[var(--r-ink-faint)]",
  },
  REVERSED: {
    label: "Reversed",
    pill: "bg-[var(--r-danger-muted)] text-[var(--r-danger)]",
    dot: "bg-[var(--r-danger)]",
  },
};

export const VERIFICATION_STATUS_META: Record<VerificationStatus, StatusMeta> = {
  VERIFIED: {
    label: "Verified",
    pill: "bg-[var(--r-verified-muted)] text-[var(--r-verified)]",
    dot: "bg-[var(--r-verified)]",
  },
  INVALID: {
    label: "Invalid",
    pill: "bg-[var(--r-danger-muted)] text-[var(--r-danger)]",
    dot: "bg-[var(--r-danger)]",
  },
  TAMPER_DETECTED: {
    label: "Tamper detected",
    pill: "bg-[var(--r-danger)] text-white",
    dot: "bg-white",
  },
  UNAVAILABLE: {
    label: "Unavailable",
    pill: "bg-[var(--r-neutral-muted)] text-[var(--r-ink-muted)]",
    dot: "bg-[var(--r-ink-faint)]",
  },
};

export function transactionLabel(s: TransactionStatus): string {
  return TRANSACTION_STATUS_META[s]?.label ?? humanizeStatus(s);
}

export function verificationLabel(s: VerificationStatus): string {
  return VERIFICATION_STATUS_META[s]?.label ?? humanizeStatus(s);
}
