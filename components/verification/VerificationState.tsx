import { ShieldAlert, ShieldCheck, ShieldX, CircleDashed } from "lucide-react";
import type { VerificationStatus } from "@/types";
import { verificationLabel } from "@/lib/status";
import { VerificationStatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const ICONS = {
  VERIFIED: ShieldCheck,
  INVALID: ShieldX,
  TAMPER_DETECTED: ShieldAlert,
  UNAVAILABLE: CircleDashed,
} as const;

const TONES: Record<VerificationStatus, string> = {
  VERIFIED: "bg-[var(--r-verified-muted)] text-[var(--r-verified)]",
  INVALID: "bg-[var(--r-danger-muted)] text-[var(--r-danger)]",
  TAMPER_DETECTED: "bg-[var(--r-danger)] text-white",
  UNAVAILABLE: "bg-[var(--r-neutral-muted)] text-ink-muted",
};

export interface VerificationStateProps {
  status: VerificationStatus;
  checkedAt?: string;
  detail?: string;
  className?: string;
}

/** Full verification panel — integrity state, never mixed with payment state. */
export function VerificationState({ status, checkedAt, detail, className }: VerificationStateProps) {
  const Icon = ICONS[status];
  return (
    <div className={cn("surface-card card-pad flex flex-col items-center text-center", className)}>
      <span className={cn("flex h-14 w-14 items-center justify-center rounded-2xl", TONES[status])}>
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <div className="mt-3">
        <VerificationStatusBadge status={status} />
      </div>
      <p className="type-h3 mt-2">
        {status === "VERIFIED" && "This receipt is authentic"}
        {status === "INVALID" && "This receipt could not be verified"}
        {status === "TAMPER_DETECTED" && "Tampering detected"}
        {status === "UNAVAILABLE" && "Verification unavailable"}
      </p>
      <p className="type-small mt-1.5 max-w-sm text-ink-muted">
        {detail ?? defaultDetail(status)}
      </p>
      {checkedAt && (
        <p className="type-caption mt-3 text-ink-faint">
          {verificationLabel(status)} check · {formatDateTime(checkedAt)}
        </p>
      )}
    </div>
  );
}

function defaultDetail(status: VerificationStatus): string {
  switch (status) {
    case "VERIFIED":
      return "The record matches Receipti's trusted copy. Payment status is shown separately.";
    case "INVALID":
      return "The record does not match. Treat this receipt as unverified and contact the merchant.";
    case "TAMPER_DETECTED":
      return "This record differs from the trusted copy. Do not accept it — report it to the merchant.";
    case "UNAVAILABLE":
      return "We couldn't reach the verification service. Payment status is unaffected — try again shortly.";
  }
}
