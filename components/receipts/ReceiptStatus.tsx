import type { TransactionStatus, VerificationStatus } from "@/types";
import { TransactionStatusBadge, VerificationStatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

export interface ReceiptStatusProps {
  status: TransactionStatus;
  verification: VerificationStatus;
  className?: string;
}

/**
 * Renders BOTH statuses side by side — transaction and verification
 * are independent systems and must never be merged.
 */
export function ReceiptStatus({ status, verification, className }: ReceiptStatusProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <TransactionStatusBadge status={status} />
      <VerificationStatusBadge status={verification} />
    </div>
  );
}
