"use client";

import Link from "next/link";
import { CloudOff, FileQuestion, Loader2, RotateCcw } from "lucide-react";
import { Button, Card, EmptyState } from "@/components/ui";

/** Structured skeleton shown while the receipt loads. */
export function ReceiptSkeleton() {
  return (
    <div role="status" aria-label="Retrieving your receipt" className="flex flex-col gap-5">
      <span className="sr-only">Retrieving your receipt…</span>
      <Card aria-hidden="true" padding="none" className="overflow-hidden">
        <div className="flex flex-col items-center gap-2 border-b border-line px-6 py-6">
          <div className="skeleton h-12 w-12 !rounded-2xl" />
          <div className="skeleton h-5 w-40" />
          <div className="skeleton h-4 w-28" />
        </div>
        <div className="flex flex-col items-center gap-2 px-6 py-6">
          <div className="skeleton h-3 w-16" />
          <div className="skeleton h-9 w-48" />
          <div className="flex gap-2">
            <div className="skeleton h-6 w-20 !rounded-full" />
            <div className="skeleton h-6 w-24 !rounded-full" />
          </div>
        </div>
        <div className="space-y-3 px-6 py-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton h-14 w-14 shrink-0 !rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-3 w-1/3" />
              </div>
              <div className="skeleton h-4 w-16" />
            </div>
          ))}
        </div>
      </Card>
      <p className="type-small flex items-center justify-center gap-2 text-ink-muted" aria-hidden="true">
        <Loader2 className="h-4 w-4 animate-spin" /> Retrieving your receipt…
      </p>
    </div>
  );
}

/** The merchant sale exists but the digital receipt is still syncing. Not an error. */
export function SyncingState() {
  return (
    <Card
      role="status"
      aria-label="Receipt processing"
      className="mx-auto flex w-full max-w-md flex-col items-center py-12 text-center"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--r-info-muted)] text-[var(--r-info)]">
        <Loader2 className="h-7 w-7 animate-spin" aria-hidden="true" />
      </span>
      <h1 className="type-h2 mt-4">Receipt processing</h1>
      <p className="type-small mt-2 max-w-xs text-ink-muted">
        The merchant transaction was received — your digital receipt is still being
        created. This usually takes a few seconds.
      </p>
      <div className="skeleton mt-6 h-2 w-48 !rounded-full" aria-hidden="true" />
    </Card>
  );
}

const NOT_FOUND_REASONS = [
  "The reference was typed incorrectly",
  "The receipt has not synced yet",
  "The record is temporarily unavailable",
] as const;

export function NotFoundState({
  reference,
  onRetry,
}: {
  reference: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <EmptyState
        icon={<FileQuestion className="h-8 w-8" aria-hidden="true" />}
        title="Receipt not found"
        description={`We couldn't locate a Receipti record for “${reference}”.`}
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={onRetry} leftIcon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}>
              Try again
            </Button>
            <Link href="/demo/customer-receipt">
              <Button variant="outline" className="w-full sm:w-auto">
                Open demo receipt
              </Button>
            </Link>
          </div>
        }
      />
      <Card className="mx-auto w-full max-w-md">
        <p className="type-small flex items-center gap-2 font-semibold">
          <CloudOff className="h-4 w-4 text-ink-faint" aria-hidden="true" />
          Possible reasons
        </p>
        <ul className="type-small mt-2.5 list-disc space-y-1 pl-5 text-ink-muted">
          {NOT_FOUND_REASONS.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
