import Link from "next/link";
import { ChevronRight, Store } from "lucide-react";
import type { Receipt } from "@/types";
import { formatDateTime, formatMoney } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { ReceiptStatus } from "./ReceiptStatus";
import { cn } from "@/lib/utils";

export interface ReceiptCardProps {
  receipt: Receipt;
  href?: string;
  className?: string;
}

/** Compact receipt summary row — used by wallet lists & dashboards. */
export function ReceiptCard({ receipt, href, className }: ReceiptCardProps) {
  const content = (
    <Card padding="md" hover={!!href} className={cn("flex items-center gap-4", className)}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--r-primary-muted)] text-[var(--r-primary)]">
        <Store className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate text-sm font-semibold text-ink">{receipt.merchant.name}</p>
          <p className="type-amount shrink-0 text-[0.9375rem]" data-numeric>
            {formatMoney(receipt.totals.grandTotal)}
          </p>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-3">
          <p className="type-caption truncate text-ink-muted" data-mono>
            {receipt.receiptNumber}
          </p>
          <p className="type-caption shrink-0 text-ink-faint">{formatDateTime(receipt.issuedAt)}</p>
        </div>
        <ReceiptStatus status={receipt.status} verification={receipt.verification} className="mt-2.5" />
      </div>
      {href && <ChevronRight className="h-5 w-5 shrink-0 text-ink-faint" aria-hidden="true" />}
    </Card>
  );

  if (!href) return content;
  return (
    <Link
      href={href}
      aria-label={`Open receipt ${receipt.receiptNumber} from ${receipt.merchant.name}`}
      className="block rounded-2xl"
    >
      {content}
    </Link>
  );
}
