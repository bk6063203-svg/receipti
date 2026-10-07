"use client";

import Link from "next/link";
import { Check, Plug } from "lucide-react";
import type { Merchant } from "@/types/merchant";
import type { PosReceipt } from "@/types/pos";
import { formatDateTime } from "@/lib/format";
import { Button, Card } from "@/components/ui";

export function IntegrationCard({ merchant, receipts }: { merchant: Merchant; receipts: PosReceipt[] }) {
  const latest = receipts[0];
  return (
    <Card as="section" aria-label="Receipti integration status" className="flex h-full flex-col">
      <p className="type-label text-ink-faint">Receipti integration</p>
      <h2 className="mt-1 flex items-center gap-2 text-[0.9375rem] font-semibold">
        <Plug className="h-4 w-4 text-ink-muted" aria-hidden="true" />
        {merchant.posName}
      </h2>
      <p className="mt-2">
        <span className="type-status inline-flex items-center gap-1.5 rounded-full bg-[var(--r-verified-muted)] px-2.5 py-1 text-[var(--r-verified)]">
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          Connected (demo)
        </span>
      </p>
      <dl className="type-small mt-3 space-y-1.5 text-ink-muted">
        <div className="flex justify-between gap-3">
          <dt>Last activity</dt>
          <dd className="font-semibold text-ink tnum">{latest ? formatDateTime(latest.issuedAt) : "—"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Receipts synchronized</dt>
          <dd className="font-semibold text-ink tnum" data-numeric>
            {receipts.length}
          </dd>
        </div>
      </dl>
      <p className="type-caption mt-3 text-ink-faint">
        {merchant.posName} stays the system of record — Receipti mirrors its receipts.
      </p>
      <span className="flex-1" />
      <Link href="/merchant/integration" className="mt-4 block">
        <Button variant="outline" size="sm" className="w-full">
          View integration
        </Button>
      </Link>
    </Card>
  );
}
