"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Fuel, ReceiptText, ScanSearch } from "lucide-react";
import type { PosReceipt } from "@/types/pos";
import { formatMoney } from "@/lib/format";
import { inclusiveTaxMinor } from "@/lib/pos";
import { buildFuelReceipt, FUEL_DEMO } from "@/lib/fuel-check";
import { saveReceipt } from "@/lib/pos-store";
import { Button, Card, TransactionStatusBadge } from "@/components/ui";

const pkr = (minor: number) => formatMoney({ amountMinor: minor, currency: "PKR" });
const LINE_MINOR = Math.round(FUEL_DEMO.quantityL * FUEL_DEMO.priceMinorPerL);

/** Simulated fuel POS: review the fill-up, then complete it locally. */
export function FuelPosCard({
  onComplete,
  completed,
}: {
  onComplete: (receipt: PosReceipt) => void;
  completed: boolean;
}) {
  const [processing, setProcessing] = React.useState(false);

  const complete = () => {
    setProcessing(true);
    window.setTimeout(() => {
      const receipt = buildFuelReceipt(new Date());
      saveReceipt(receipt);
      setProcessing(false);
      onComplete(receipt);
    }, 1100);
  };

  return (
    <Card as="section" aria-label="Fuel station POS" className="h-full">
      <p className="type-label text-ink-faint">Fuel station POS · simulated</p>
      <h2 className="mt-1 flex items-center gap-2 text-lg font-bold uppercase tracking-wide">
        <Fuel className="h-5 w-5 text-[var(--r-primary)]" aria-hidden="true" />
        {FUEL_DEMO.fuelType}
      </h2>
      <p className="type-small mt-1 text-ink-muted tnum">
        {FUEL_DEMO.quantityL.toFixed(2)} L × {pkr(FUEL_DEMO.priceMinorPerL)}
      </p>

      <dl className="mt-4 space-y-1.5 border-t border-line pt-4">
        <div className="flex justify-between">
          <dt className="type-small text-ink-muted">Subtotal</dt>
          <dd className="type-small tnum" data-numeric>{pkr(LINE_MINOR)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="type-small text-ink-muted">Tax (incl.)</dt>
          <dd className="type-small tnum" data-numeric>{pkr(inclusiveTaxMinor(LINE_MINOR))}</dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-line pt-2.5">
          <dt className="type-small font-semibold">Total</dt>
          <dd className="type-amount text-2xl tnum" data-numeric>{pkr(LINE_MINOR)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="type-small text-ink-muted">Payment</dt>
          <dd className="type-small font-semibold">Card</dd>
        </div>
        <div className="flex justify-between">
          <dt className="type-small text-ink-muted">Transaction</dt>
          <dd className="type-small font-semibold" data-mono>{FUEL_DEMO.transactionId}</dd>
        </div>
      </dl>

      <div className="mt-4">
        {completed ? (
          <p className="type-small flex items-center gap-2 rounded-xl bg-[var(--r-verified-muted)] px-3.5 py-2.5 font-medium text-[var(--r-verified)]" role="status">
            <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
            Transaction recorded — receipt below.
          </p>
        ) : (
          <Button size="lg" className="w-full" onClick={complete} loading={processing}>
            {processing ? "Recording…" : "Complete transaction"}
          </Button>
        )}
      </div>
      <p className="type-caption mt-3 text-ink-faint">
        No real payment is processed — the transaction is created on this device only.
      </p>
    </Card>
  );
}

/** The Receipti record handoff: POS → Receipti → receipt created. */
export function ReceiptReadyCard({ receipt }: { receipt: PosReceipt }) {
  return (
    <Card as="section" aria-label="Digital receipt ready" className="h-full border-[var(--r-primary)]/30">
      <p className="type-label text-[var(--r-primary)]">POS → Receipti → receipt created</p>
      <h2 className="type-h3 mt-1">Digital receipt ready</h2>
      <dl className="mt-3 space-y-2">
        <div className="flex justify-between gap-3">
          <dt className="type-small text-ink-muted">Receipt ID</dt>
          <dd className="type-small font-bold" data-mono>{receipt.id}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="type-small text-ink-muted">Transaction ID</dt>
          <dd className="type-small font-semibold" data-mono>{receipt.transactionId}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="type-small text-ink-muted">Status</dt>
          <dd>
            <TransactionStatusBadge status="PAID" />
          </dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Link href={`/receipt/${receipt.reference}`} className="flex-1">
          <Button className="w-full" leftIcon={<ReceiptText className="h-4 w-4" aria-hidden="true" />}>
            View digital receipt
          </Button>
        </Link>
        <Link href={`/verify/${receipt.reference}`} className="flex-1">
          <Button variant="outline" className="w-full" leftIcon={<ScanSearch className="h-4 w-4" aria-hidden="true" />}>
            Verify receipt
          </Button>
        </Link>
      </div>
      <p className="type-caption mt-3 text-ink-faint">
        Opens the standard Receipti receipt and verification experiences — nothing is duplicated.
      </p>
    </Card>
  );
}
