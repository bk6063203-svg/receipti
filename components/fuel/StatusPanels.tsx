"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Check, Store } from "lucide-react";
import type { PosReceipt, ReceiptTxState } from "@/types/pos";
import { formatDateTime, formatMoney, formatTime } from "@/lib/format";
import { receiptTxState, refundedMinorTotal } from "@/lib/pos";
import { FUEL_DEMO } from "@/lib/fuel-check";
import { Button, Card, TransactionStatusBadge, VerificationStatusBadge } from "@/components/ui";
import { cn } from "@/lib/utils";

export type ComparisonState = "match" | "mismatch" | "none";

/** Verification, transaction, and comparison stay three separate facts. */
export function StatusStrip({
  receipt,
  comparison,
}: {
  receipt: PosReceipt | null;
  comparison: ComparisonState;
}) {
  if (!receipt) return null;
  const tx: ReceiptTxState = receiptTxState(receipt);
  return (
    <Card as="section" aria-label="Record status" className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-2">
        <p className="flex items-center gap-2">
          <span className="type-small text-ink-muted">Verification</span>
          <VerificationStatusBadge status={receipt.verification} />
        </p>
        <p className="flex items-center gap-2">
          <span className="type-small text-ink-muted">Transaction</span>
          {tx === "PARTIALLY_REFUNDED" ? (
            <span className="type-status inline-flex items-center rounded-full bg-[var(--r-warning-muted)] px-2.5 py-1 text-[var(--r-warning)]">
              Partially refunded
            </span>
          ) : (
            <TransactionStatusBadge status={tx} />
          )}
        </p>
        <p className="flex items-center gap-2">
          <span className="type-small text-ink-muted">Comparison</span>
          {comparison === "match" && (
            <span className="type-status inline-flex items-center gap-1.5 rounded-full bg-[var(--r-verified-muted)] px-2.5 py-1 text-[var(--r-verified)]">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Matched
            </span>
          )}
          {comparison === "mismatch" && (
            <span className="type-status inline-flex items-center gap-1.5 rounded-full bg-[var(--r-warning-muted)] px-2.5 py-1 text-[var(--r-warning)]">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
              Discrepancy detected
            </span>
          )}
          {comparison === "none" && <span className="type-small text-ink-faint">Not checked yet</span>}
        </p>
      </div>
      <p className="type-caption text-ink-faint sm:max-w-48 sm:text-right">
        A verified record can still differ from presented figures — separate facts.
      </p>
    </Card>
  );
}

/** Phase 06 refund state, read from the same receipt record. */
export function RefundStrip({ receipt, onReload }: { receipt: PosReceipt | null; onReload: () => void }) {
  if (!receipt) return null;
  const refunded = refundedMinorTotal(receipt);
  const tx = receiptTxState(receipt);
  return (
    <Card as="section" aria-label="Refund state">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[0.9375rem] font-semibold">Refund state</h2>
        <Button variant="ghost" size="sm" onClick={onReload}>
          Reload record
        </Button>
      </div>
      {refunded <= 0 ? (
        <p className="type-small mt-2 text-ink-muted">
          No refund recorded for this transaction — status{" "}
          <span className="font-semibold text-ink">{tx === "PAID" ? "Paid" : tx}</span>. Any
          refund made on the receipt page appears here after reloading.
        </p>
      ) : (
        <dl className="mt-3 grid grid-cols-3 gap-2">
          {[
            ["Original", formatMoney({ amountMinor: receipt.totalMinor, currency: receipt.currency })],
            ["Refunded", formatMoney({ amountMinor: refunded, currency: receipt.currency })],
            ["Status", tx === "PARTIALLY_REFUNDED" ? "Partially refunded" : "Refunded"],
          ].map(([term, value]) => (
            <div key={term} className="rounded-xl bg-background px-3 py-2.5 text-center">
              <dt className="type-caption text-ink-faint">{term}</dt>
              <dd className="type-small mt-0.5 font-bold tnum" data-numeric>{value}</dd>
            </div>
          ))}
        </dl>
      )}
      <Link
        href={`/receipt/${receipt.reference}#refunds`}
        className="type-small mt-3 inline-flex items-center gap-1 font-semibold text-[var(--r-primary)]"
      >
        Open returns & refunds
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </Card>
  );
}

export interface CheckEvent {
  at: string;
  summary: string;
  mismatch: boolean;
}

/** Demo timeline from purchase to latest check. */
export function FuelTimeline({
  receipt,
  loadedAt,
  checks,
}: {
  receipt: PosReceipt;
  loadedAt: string | null;
  checks: CheckEvent[];
}) {
  const nodes: { time: string; title: string; warn?: boolean }[] = [
    { time: receipt.issuedAt, title: "Fuel transaction completed" },
    { time: receipt.issuedAt, title: "Receipti receipt created" },
  ];
  if (loadedAt) nodes.push({ time: loadedAt, title: "Receipt record accessed" });
  for (const c of checks) nodes.push({ time: c.at, title: c.summary, warn: c.mismatch });

  return (
    <Card as="section" aria-label="Transaction timeline" className="h-full">
      <h2 className="text-[0.9375rem] font-semibold">Timeline</h2>
      <ol className="relative mt-4 flex flex-col border-l-2 border-line" aria-label="Fuel transaction timeline">
        {nodes.map((n, i) => (
          <li key={`${n.time}-${i}`} className="relative flex gap-3 pb-5 pl-5 last:pb-1">
            <span
              aria-hidden="true"
              className={cn(
                "absolute -left-[9px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full",
                n.warn ? "bg-[var(--r-warning)] text-white" : "bg-[var(--r-primary)] text-white"
              )}
            >
              {n.warn ? (
                <AlertTriangle className="h-2.5 w-2.5" strokeWidth={3} />
              ) : (
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              )}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{n.title}</p>
              <p className="type-caption text-ink-muted tnum">{formatTime(n.time)}</p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

/** The same transaction from the merchant's side — no blame, just facts. */
export function MerchantSideCard({
  receipt,
  comparison,
}: {
  receipt: PosReceipt;
  comparison: ComparisonState;
}) {
  const line = receipt.lines[0];
  return (
    <Card as="section" aria-label="Merchant view" className="h-full">
      <h2 className="flex items-center gap-2 text-[0.9375rem] font-semibold">
        <Store className="h-4 w-4 text-ink-muted" aria-hidden="true" />
        Merchant view
      </h2>
      <dl className="mt-3 space-y-2">
        <div className="flex justify-between gap-3">
          <dt className="type-small text-ink-muted">Fuel transaction</dt>
          <dd className="type-small font-bold" data-mono>{receipt.transactionId}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="type-small text-ink-muted">Amount</dt>
          <dd className="type-small font-semibold tnum" data-numeric>
            {formatMoney({ amountMinor: receipt.totalMinor, currency: receipt.currency })}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="type-small text-ink-muted">Quantity</dt>
          <dd className="type-small font-semibold tnum">{(line?.quantity ?? 0).toFixed(2)} L</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="type-small text-ink-muted">Status</dt>
          <dd>
            <TransactionStatusBadge status="PAID" />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="type-small text-ink-muted">Verification</dt>
          <dd>
            <VerificationStatusBadge status={receipt.verification} />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line pt-2.5">
          <dt className="type-small text-ink-muted">Customer comparison</dt>
          <dd>
            {comparison === "mismatch" ? (
              <span className="type-status inline-flex items-center gap-1.5 rounded-full bg-[var(--r-warning-muted)] px-2.5 py-1 text-[var(--r-warning)]">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                Discrepancy detected
              </span>
            ) : comparison === "match" ? (
              <span className="type-status inline-flex items-center gap-1.5 rounded-full bg-[var(--r-verified-muted)] px-2.5 py-1 text-[var(--r-verified)]">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Matched
              </span>
            ) : (
              <span className="type-small text-ink-faint">Not checked yet</span>
            )}
          </dd>
        </div>
      </dl>
      <p className="type-caption mt-3 text-ink-faint">
        A difference is a prompt to review — not a verdict about the merchant.
      </p>
      <Link href="/merchant" className="mt-3 block">
        <Button variant="outline" size="sm" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
          Open in merchant dashboard
        </Button>
      </Link>
      <p className="type-caption mt-2 text-center text-ink-faint">
        Switch to {FUEL_DEMO.merchant} · {formatDateTime(receipt.issuedAt)}
      </p>
    </Card>
  );
}
