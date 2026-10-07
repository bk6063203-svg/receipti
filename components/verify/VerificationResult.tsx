"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CloudOff,
  FileQuestion,
  ReceiptText,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Undo2,
} from "lucide-react";
import type { ReceiptTxState } from "@/types/pos";
import type { VerificationResultData, VerifyOutcome } from "@/types/verification";
import { formatDateTime, formatMoney } from "@/lib/format";
import { aed, receiptTxState } from "@/lib/pos";
import { Button, Card, TransactionStatusBadge, VerificationStatusBadge } from "@/components/ui";
import { Rise } from "@/components/receipt";
import { ComparisonTable, buildCompareRows } from "./ComparisonTable";

const HERO: Record<
  VerifyOutcome,
  { icon: React.ComponentType<{ className?: string }>; iconClass: string; title: string; description: string }
> = {
  VERIFIED: {
    icon: ShieldCheck,
    iconClass: "bg-[var(--r-verified)] text-white",
    title: "✓ Receipt Verified",
    description: "The receipt matches the trusted Receipti record.",
  },
  MISMATCH: {
    icon: ShieldAlert,
    iconClass: "bg-[var(--r-danger)] text-white",
    title: "⚠ Record Mismatch",
    description:
      "The presented receipt information does not match the trusted Receipti record. This is a factual report — not an accusation against any party.",
  },
  NOT_FOUND: {
    icon: FileQuestion,
    iconClass: "bg-[var(--r-neutral-muted)] text-ink-muted",
    title: "Receipt Not Found",
    description: "No Receipti record was found for this reference.",
  },
  UNAVAILABLE: {
    icon: CloudOff,
    iconClass: "bg-[var(--r-neutral-muted)] text-ink-muted",
    title: "Verification Temporarily Unavailable",
    description:
      "The Receipti record could not be retrieved right now. This is a technical state — different from a missing or invalid record.",
  },
};

const NOT_FOUND_REASONS = [
  "The reference may be incorrect",
  "The receipt may not have synced yet",
  "The record may be unavailable",
] as const;

function PartialPill() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--r-warning-muted)] px-2.5 py-1 type-status text-[var(--r-warning)]">
      <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
      Partially refunded
    </span>
  );
}

function TxPill({ state }: { state: ReceiptTxState }) {
  if (state === "PARTIALLY_REFUNDED") return <PartialPill />;
  return <TransactionStatusBadge status={state} />;
}

export function VerificationResult({
  result,
  onRetry,
}: {
  result: VerificationResultData;
  onRetry: () => void;
}) {
  const hero = HERO[result.status];
  const Icon = hero.icon;
  const trusted = result.trusted;
  const txState: ReceiptTxState | null = trusted ? receiptTxState(trusted) : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Result hero */}
      <Rise>
        <Card
          as="section"
          aria-label={`Verification result: ${hero.title}`}
          padding="lg"
          className="flex flex-col items-center text-center"
        >
          <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${hero.iconClass}`}>
            <Icon className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="type-h1 mt-4">{hero.title}</h1>
          <p className="type-body mt-2 max-w-md text-ink-muted">{hero.description}</p>
          <p className="type-caption mt-3 text-ink-faint">
            Reference <span className="font-semibold" data-mono>{result.reference}</span>
            {" · Checked "}
            <span className="tnum">{formatDateTime(result.verifiedAt)}</span>
          </p>

          {result.status === "VERIFIED" && txState && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2" role="list" aria-label="Record states">
              <span role="listitem">
                <TxPill state={txState} />
              </span>
              <span role="listitem">
                <VerificationStatusBadge status="VERIFIED" />
              </span>
            </div>
          )}
          {result.status === "VERIFIED" && txState && txState !== "PAID" && (
            <p className="type-small mt-3 max-w-md rounded-xl bg-background px-4 py-2.5 text-ink-muted">
              Verification confirms the record is authentic — it does not mean the
              transaction is currently paid. A {txState === "REFUNDED" ? "refunded" : "partially refunded"} receipt
              can be fully verified.
            </p>
          )}
          {result.status === "MISMATCH" && (
            <p className="type-small mt-4 rounded-xl bg-[var(--r-danger-muted)]/40 px-4 py-2.5 font-medium text-[var(--r-danger)]">
              {result.differences.length} {result.differences.length === 1 ? "field differs" : "fields differ"} from the
              trusted record — highlighted below.
            </p>
          )}
          {result.status === "NOT_FOUND" && (
            <ul className="type-small mt-4 list-disc space-y-1 pl-5 text-left text-ink-muted" aria-label="Possible reasons">
              {result.reason && <li>{result.reason}</li>}
              {NOT_FOUND_REASONS.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
          {result.status === "UNAVAILABLE" && result.reason && (
            <p className="type-small mt-4 max-w-md rounded-xl bg-background px-4 py-2.5 text-ink-muted">
              {result.reason}
            </p>
          )}
        </Card>
      </Rise>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Receipt summary */}
        {trusted && (
          <Rise delay={0.08} className="min-w-0">
            <Card as="section" aria-label="Trusted receipt summary">
              <h2 className="type-label text-ink-faint">Trusted record summary</h2>
              <p className="type-h3 mt-2">{trusted.merchant}</p>
              <p className="type-small text-ink-muted">{trusted.branch}</p>
              <dl className="mt-4 space-y-2 border-t border-dashed border-line pt-4">
                <div className="flex justify-between gap-3">
                  <dt className="type-small text-ink-muted">Receipt</dt>
                  <dd className="type-small font-semibold" data-mono>{trusted.id}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="type-small text-ink-muted">Transaction</dt>
                  <dd className="type-small font-semibold" data-mono>{trusted.transactionId}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="type-small text-ink-muted">Date</dt>
                  <dd className="type-small font-semibold tnum">{formatDateTime(trusted.issuedAt)}</dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-line pt-2">
                  <dt className="type-small font-semibold">Total</dt>
                  <dd className="type-amount text-lg tnum" data-numeric>
                    {formatMoney(aed(trusted.totalMinor))}
                  </dd>
                </div>
                {txState && (
                  <div className="flex justify-between gap-3 pt-1">
                    <dt className="type-small text-ink-muted">Transaction status</dt>
                    <dd>
                      <TxPill state={txState} />
                    </dd>
                  </div>
                )}
              </dl>
            </Card>
          </Rise>
        )}

        {/* Actions */}
        <Rise delay={0.12} className="min-w-0">
          <Card as="section" aria-label="Verification actions" className="flex flex-col gap-2">
            {trusted && (
              <Link href={`/receipt/${result.reference}`} className="w-full">
                <Button size="lg" className="w-full" leftIcon={<ReceiptText className="h-4 w-4" aria-hidden="true" />}>
                  View receipt
                </Button>
              </Link>
            )}
            {(result.status === "NOT_FOUND" || result.status === "UNAVAILABLE") && (
              <Button size="lg" variant={trusted ? "outline" : "primary"} className="w-full" onClick={onRetry} leftIcon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}>
                Try again
              </Button>
            )}
            <Link href="/verify" className="w-full">
              <Button variant={trusted ? "outline" : "secondary"} className="w-full" leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}>
                Verify another reference
              </Button>
            </Link>
          </Card>
        </Rise>
      </div>

      {/* Field comparison */}
      {trusted && result.presented && (
        <Rise delay={0.16}>
          <section aria-label="Field comparison" className="flex flex-col gap-3">
            <h2 className="type-h3">
              {result.status === "MISMATCH" ? "What differs" : "Checked fields — all match"}
            </h2>
            <ComparisonTable rows={buildCompareRows(trusted, result.presented, result.differences)} />
          </section>
        </Rise>
      )}

      {/* Honest prototype disclosure */}
      {result.trustedFingerprint && result.presentedFingerprint && (
        <Rise delay={0.2}>
          <details className="rounded-2xl border border-line bg-[var(--r-card)] px-5 py-4">
            <summary className="cursor-pointer text-sm font-semibold">
              How this check works (prototype)
            </summary>
            <div className="type-small mt-2 space-y-2 text-ink-muted">
              <p>
                This prototype compares receipt fields directly and computes a demo
                integrity fingerprint over the canonical record. It is an honest
                functional simulation — <strong className="text-ink">not</strong> production
                cryptographic verification. A production system would use signed
                integrity hashes and secured keys.
              </p>
              <p className="type-caption" data-mono>
                Trusted fingerprint: {result.trustedFingerprint}
                <br />
                Presented fingerprint: {result.presentedFingerprint}
              </p>
            </div>
          </details>
        </Rise>
      )}
    </div>
  );
}
