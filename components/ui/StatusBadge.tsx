import * as React from "react";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  CircleDashed,
  Clock,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Undo2,
  Wallet,
} from "lucide-react";
import type { TransactionStatus, VerificationStatus } from "@/types";
import { TRANSACTION_STATUS_META, VERIFICATION_STATUS_META } from "@/lib/status";
import { cn } from "@/lib/utils";

const TX_ICONS: Record<TransactionStatus, React.ComponentType<{ className?: string }>> = {
  PAID: CheckCircle2,
  PARTIALLY_PAID: Wallet,
  REFUNDED: Undo2,
  PENDING: Clock,
  VOID: Ban,
  REVERSED: RefreshCcw,
};

const VERIFY_ICONS: Record<VerificationStatus, React.ComponentType<{ className?: string }>> = {
  VERIFIED: ShieldCheck,
  INVALID: ShieldX,
  TAMPER_DETECTED: ShieldAlert,
  UNAVAILABLE: CircleDashed,
};

function Pill({
  className,
  icon: Icon,
  label,
  dot,
}: {
  className?: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  dot: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 type-status",
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} aria-hidden="true" />
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

/**
 * Transaction status badge (money state).
 * Always rendered as icon + text — never color alone.
 */
export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  const meta = TRANSACTION_STATUS_META[status];
  return <Pill icon={TX_ICONS[status] ?? AlertTriangle} label={meta.label} dot={meta.dot} className={meta.pill} />;
}

/**
 * Verification status badge (integrity state).
 * Independent from transaction status — both may appear together,
 * e.g. VERIFIED + REFUNDED.
 */
export function VerificationStatusBadge({ status }: { status: VerificationStatus }) {
  const meta = VERIFICATION_STATUS_META[status];
  return <Pill icon={VERIFY_ICONS[status] ?? AlertTriangle} label={meta.label} dot={meta.dot} className={meta.pill} />;
}

/** @deprecated Use TransactionStatusBadge / VerificationStatusBadge. */
export const StatusBadge = TransactionStatusBadge;
