"use client";

import * as React from "react";
import { AlertTriangle, Check, CircleDashed, Fingerprint, KeyRound, RefreshCw, ShieldAlert } from "lucide-react";
import type { PosReceipt } from "@/types/pos";
import { formatDateTime } from "@/lib/format";
import { syncStatsFor } from "@/lib/integration";
import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/utils";

/* ---------------- sync simulation ---------------- */

type SyncStage = "idle" | "syncing" | "processing" | "complete";

export function SyncCard({ receipts }: { receipts: PosReceipt[] }) {
  const [stage, setStage] = React.useState<SyncStage>("idle");
  const timers = React.useRef<number[]>([]);
  const stats = syncStatsFor(receipts);

  React.useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const run = () => {
    setStage("syncing");
    timers.current = [
      window.setTimeout(() => setStage("processing"), 1100),
      window.setTimeout(() => setStage("complete"), 2200),
    ];
  };

  return (
    <Card as="section" aria-label="Receipt synchronization" className="h-full">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[0.9375rem] font-semibold">Synchronization</h2>
        <Button
          size="sm"
          onClick={run}
          disabled={stage === "syncing" || stage === "processing"}
          loading={stage === "syncing" || stage === "processing"}
          leftIcon={stage === "idle" || stage === "complete" ? <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> : undefined}
        >
          {stage === "syncing" ? "Syncing…" : stage === "processing" ? "Processing…" : "Sync now"}
        </Button>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["Received", String(stats.received)],
          ["Processed", String(stats.processed)],
          ["Pending", String(stats.pending)],
          ["Failed", String(stats.failed)],
        ].map(([term, value]) => (
          <div key={term} className="rounded-xl bg-background px-3 py-2.5 text-center">
            <dt className="type-caption text-ink-faint">{term}</dt>
            <dd className="type-small mt-0.5 font-bold tnum" data-numeric>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="type-small mt-3 text-ink-muted">
        Last sync:{" "}
        <span className="font-semibold text-ink tnum">
          {stats.lastSync ? formatDateTime(stats.lastSync) : "—"}
        </span>
      </p>

      <div aria-live="polite">
        {stage === "complete" && (
          <p className="type-small mt-3 flex items-center gap-2 rounded-xl bg-[var(--r-verified-muted)] px-3.5 py-2.5 text-[var(--r-verified)]">
            <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
            Simulation complete — {stats.received} records received, {stats.processed}{" "}
            processed. No external system was contacted.
          </p>
        )}
        {(stage === "syncing" || stage === "processing") && (
          <p className="type-small mt-3 flex items-center gap-2 rounded-xl bg-background px-3.5 py-2.5 text-ink-muted">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--r-primary)] motion-reduce:animate-none" aria-hidden="true" />
            {stage === "syncing" ? "Receiving records from the demo POS…" : "Processing receipt records…"}
          </p>
        )}
      </div>
    </Card>
  );
}

/* ---------------- idempotency demo ---------------- */

export function IdempotencyDemo({ receipt }: { receipt: PosReceipt | undefined }) {
  const [attempts, setAttempts] = React.useState(0);
  const txn = receipt?.transactionId ?? "TXN-…";
  const id = receipt?.id ?? "RCPT-…";

  return (
    <Card as="section" aria-label="Idempotency demonstration" className="h-full">
      <h2 className="flex items-center gap-2 text-[0.9375rem] font-semibold">
        <Fingerprint className="h-4 w-4 text-ink-muted" aria-hidden="true" />
        Idempotency
      </h2>
      <p className="type-small mt-1 text-ink-muted">
        If the merchant sends the same transaction twice, Receipti must not create a
        duplicate receipt. Try it:
      </p>
      <p className="type-small mt-3 rounded-xl bg-background px-3.5 py-2.5">
        Transaction ID:{" "}
        <span className="font-bold" data-mono>{txn}</span>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => setAttempts((n) => n + 1)}>
          {attempts === 0 ? "Send transaction" : "Send same transaction again"}
        </Button>
        {attempts > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setAttempts(0)}>
            Reset
          </Button>
        )}
      </div>
      <ol className="mt-3 flex flex-col gap-2" aria-live="polite" aria-label="Send attempts">
        {attempts >= 1 && (
          <li className="type-small flex items-start gap-2 rounded-xl border border-line px-3.5 py-2.5">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--r-verified)]" aria-hidden="true" />
            <span>
              <span className="font-semibold">First attempt → receipt created.</span>{" "}
              <span className="text-ink-muted" data-mono>{id}</span>
            </span>
          </li>
        )}
        {attempts >= 2 && (
          <li className="type-small flex items-start gap-2 rounded-xl border border-line px-3.5 py-2.5">
            <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-[var(--r-primary)]" aria-hidden="true" />
            <span>
              <span className="font-semibold">
                {attempts === 2 ? "Second" : `Attempt ${attempts}`} → existing receipt returned.
              </span>{" "}
              <span className="text-ink-muted">
                Same idempotency key — <span data-mono>{id}</span>, no duplicate.
              </span>
            </span>
          </li>
        )}
      </ol>
    </Card>
  );
}

/* ---------------- error states + retry demo ---------------- */

const ERRORS = [
  {
    icon: AlertTriangle,
    tone: "bg-[var(--r-danger-muted)] text-[var(--r-danger)]",
    title: "Invalid payload",
    detail: "Required field missing: currency.",
  },
  {
    icon: Fingerprint,
    tone: "bg-[var(--r-warning-muted)] text-[var(--r-warning)]",
    title: "Duplicate transaction",
    detail: "Transaction already exists — existing receipt returned.",
  },
  {
    icon: ShieldAlert,
    tone: "bg-[var(--r-danger-muted)] text-[var(--r-danger)]",
    title: "Invalid authentication",
    detail: "Connection credentials could not be verified.",
  },
];

export function ErrorsSection({ receipt }: { receipt: PosReceipt | undefined }) {
  const [retrying, setRetrying] = React.useState(false);
  const [retried, setRetried] = React.useState(false);
  const base = receipt?.issuedAt ?? new Date().toISOString();

  const retry = () => {
    setRetrying(true);
    window.setTimeout(() => {
      setRetrying(false);
      setRetried(true);
    }, 1300);
  };

  return (
    <Card as="section" aria-label="Error handling demonstration" id="errors" className="scroll-mt-24">
      <h2 className="text-[0.9375rem] font-semibold">Error handling</h2>
      <p className="type-small mt-1 text-ink-muted">
        Realistic failure states with plain explanations — never stack traces.
      </p>
      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {ERRORS.map((e) => {
          const Icon = e.icon;
          return (
            <li key={e.title} className="rounded-xl border border-line p-3.5">
              <p className={cn("inline-flex h-8 w-8 items-center justify-center rounded-lg", e.tone)}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </p>
              <p className="mt-2 text-sm font-bold uppercase tracking-wide">{e.title}</p>
              <p className="type-small mt-1 text-ink-muted">{e.detail}</p>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 rounded-xl border border-line p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold uppercase tracking-wide">Temporary unavailable → retry</p>
          <Button size="sm" variant="outline" onClick={retry} disabled={retrying || retried} loading={retrying}>
            {retried ? "Delivered" : retrying ? "Retrying…" : "Simulate retry"}
          </Button>
        </div>
        <p className="type-small mt-1 text-ink-muted">
          Merchant POS → Receipti → processing failed → retry{receipt ? ` (${receipt.id})` : ""}.
        </p>
        <ol className="mt-3 flex flex-col gap-1.5" aria-live="polite" aria-label="Retry attempts">
          <li className="type-small flex items-center gap-2 rounded-lg bg-background px-3 py-2">
            <CircleDashed className="h-3.5 w-3.5 shrink-0 text-[var(--r-danger)]" aria-hidden="true" />
            <span className="font-semibold">Attempt 1</span>
            <span className="text-ink-faint tnum">{formatDateTime(base)}</span>
            <span className="ml-auto font-medium text-[var(--r-danger)]">Failed</span>
          </li>
          {(retrying || retried) && (
            <li className="type-small flex items-center gap-2 rounded-lg bg-background px-3 py-2">
              {retried ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-[var(--r-verified)]" aria-hidden="true" />
              ) : (
                <span className="h-3.5 w-3.5 shrink-0 animate-pulse rounded-full bg-[var(--r-warning)] motion-reduce:animate-none" aria-hidden="true" />
              )}
              <span className="font-semibold">Attempt 2</span>
              <span className="text-ink-faint tnum">{formatDateTime(base)}</span>
              <span className={cn("ml-auto font-medium", retried ? "text-[var(--r-verified)]" : "text-[var(--r-warning)]")}>
                {retried ? "Delivered" : "Retrying…"}
              </span>
            </li>
          )}
        </ol>
      </div>
    </Card>
  );
}
