"use client";

import * as React from "react";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { ReceiptRecord, ReceiptStatus } from "@/lib/live-receipt-record";
import { LIVE_CLAIM_LABEL, LIVE_METHOD_LABEL, pkr } from "@/lib/live-transaction";
import { Badge, Card } from "@/components/ui";
import { ProductThumb } from "./ProductThumb";

const STATUS_TONE: Record<ReceiptStatus, "success" | "warning" | "neutral" | "danger"> = {
  VALID: "success",
  PARTIAL: "warning",
  REFUNDED: "neutral",
  VOIDED: "danger",
};

const STATUS_LABEL: Record<ReceiptStatus, string> = {
  VALID: "Valid",
  PARTIAL: "Partially refunded",
  REFUNDED: "Refunded",
  VOIDED: "Voided",
};

export function ReceiptStatusPill({ status }: { status: ReceiptStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}

/** Full finalized receipt — shared by the receipt page, wallet, and history. */
export function LiveReceiptCard({
  record: r,
  showCustomer = false,
  action,
}: {
  record: ReceiptRecord;
  /** Show the owning customer id (merchant viewing their own record only). */
  showCustomer?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <Card as="article" aria-label={`Receipt ${r.receiptId}`} className="w-full">
      <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="text-base font-bold">{r.merchantName}</p>
          <p className="type-small text-ink-muted">{r.transactionId}</p>
          <p className="type-caption mt-0.5 text-ink-faint">Final receipt · Demo</p>
        </div>
        <span className="flex flex-col items-end gap-1.5">
          <ReceiptStatusPill status={r.receiptStatus} />
          {r.receiptStatus === "VALID" && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--r-verified)]">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" /> Paid (Demo)
            </span>
          )}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 py-4">
        <div>
          <dt className="type-caption text-ink-faint">Receipt</dt>
          <dd className="type-small font-bold" data-mono>{r.receiptId}</dd>
        </div>
        <div>
          <dt className="type-caption text-ink-faint">Issued</dt>
          <dd className="type-small font-semibold tnum">{formatDateTime(r.issuedAt)}</dd>
        </div>
        <div>
          <dt className="type-caption text-ink-faint">Method</dt>
          <dd className="type-small font-semibold">{LIVE_METHOD_LABEL[r.method]}</dd>
        </div>
        <div>
          <dt className="type-caption text-ink-faint">Payment</dt>
          <dd className="type-small font-semibold">{r.paymentStatus.replace(/_/g, " ")}</dd>
        </div>
        {showCustomer && (
          <div className="col-span-2">
            <dt className="type-caption text-ink-faint">Customer</dt>
            <dd className="type-small font-semibold" data-mono>{r.customerId ?? "Unclaimed"}</dd>
          </div>
        )}
      </dl>

      <ul className="flex flex-col gap-2 border-t border-line pt-4" aria-label="Receipt lines">
        {r.lines.map((l) => (
          <li key={l.sku} className="flex items-center gap-3">
            <ProductThumb image={l.image} name={l.name} size={44} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{l.name}</p>
              <p className="type-caption text-ink-muted tnum">
                {l.size} · {l.colour} · {l.quantity} × {formatMoney(pkr(l.unitMinor))}
              </p>
            </div>
            <span className="shrink-0 text-sm font-bold tnum" data-numeric>
              {formatMoney(pkr(l.unitMinor * l.quantity))}
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-4 flex flex-col gap-1.5 border-t border-line pt-4">
        <div className="flex justify-between">
          <dt className="type-small text-ink-muted">Subtotal</dt>
          <dd className="type-small font-semibold tnum">{formatMoney(pkr(r.subtotalMinor))}</dd>
        </div>
        {r.discountMinor > 0 && (
          <>
            <div className="flex justify-between">
              <dt className="type-small text-ink-muted">Discount ({r.discountLabel})</dt>
              <dd className="type-small font-semibold text-[var(--r-verified)] tnum">
                −{formatMoney(pkr(r.discountMinor))}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="type-small text-ink-muted">Amount before tax</dt>
              <dd className="type-small font-semibold tnum">
                {formatMoney(pkr(r.subtotalMinor - r.discountMinor))}
              </dd>
            </div>
          </>
        )}
        <div className="flex justify-between">
          <dt className="type-small text-ink-muted">Sales tax ({r.taxPct}%)</dt>
          <dd className="type-small font-semibold tnum">{formatMoney(pkr(r.taxMinor))}</dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-line pt-2">
          <dt className="text-sm font-bold">Total paid</dt>
          <dd className="text-xl font-bold text-[var(--r-primary)] tnum" data-numeric>
            {formatMoney(pkr(r.totalMinor))}
          </dd>
        </div>
        {r.refundedMinor > 0 && (
          <div className="flex justify-between">
            <dt className="type-small text-ink-muted">Refunded (separate audit events)</dt>
            <dd className="type-small font-semibold tnum">−{formatMoney(pkr(r.refundedMinor))}</dd>
          </div>
        )}
      </dl>

      <div className="mt-4 rounded-xl bg-background px-4 py-3">
        <p className="type-small text-ink-muted">
          {r.claimedAt && r.claimMethod ? (
            <>Claimed via <strong className="text-ink">{LIVE_CLAIM_LABEL[r.claimMethod]}</strong> · <span className="tnum">{formatDateTime(r.claimedAt)}</span></>
          ) : (
            "Not yet claimed by the customer."
          )}
        </p>
      </div>

      {action && <div className="mt-4">{action}</div>}

      <p className="type-caption mt-3 text-center text-ink-faint">
        Demo receipt — no real payment was processed.{" "}
        <Link href={`/live/verify?receipt=${encodeURIComponent(r.receiptId)}`} className="font-semibold text-[var(--r-primary)]">
          Verify this receipt
        </Link>
      </p>
    </Card>
  );
}
