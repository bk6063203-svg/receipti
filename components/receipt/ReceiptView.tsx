"use client";

import * as React from "react";
import QRCode from "react-qr-code";
import { ScanLine, Undo2 } from "lucide-react";
import type { PosReceipt, ReceiptTxState } from "@/types/pos";
import { ProductImage } from "./ProductImage";
import { formatDate, formatMoney, formatTime } from "@/lib/format";
import { aed, PAYMENT_METHOD_LABEL, receiptTxState, refundableMinorTotal, refundedMinorTotal } from "@/lib/pos";
import { Badge, Card, TransactionStatusBadge, VerificationStatusBadge } from "@/components/ui";
import { Rise } from "./Rise";

function TxPill({ state }: { state: ReceiptTxState }) {
  if (state === "PARTIALLY_REFUNDED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--r-warning-muted)] px-2.5 py-1 type-status text-[var(--r-warning)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--r-warning)]" aria-hidden="true" />
        <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
        Partially refunded
      </span>
    );
  }
  return <TransactionStatusBadge status={state} />;
}

function merchantInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function ReceiptView({ receipt }: { receipt: PosReceipt }) {
  const [origin, setOrigin] = React.useState("");
  React.useEffect(() => setOrigin(window.location.origin), []);

  const txState = receiptTxState(receipt);
  const refunded = refundedMinorTotal(receipt);
  const receiptUrl = origin ? `${origin}/receipt/${receipt.reference}` : `/receipt/${receipt.reference}`;

  return (
    <Card as="article" aria-label={`Digital receipt ${receipt.id} from ${receipt.merchant}`} padding="none" className="overflow-hidden">
      {/* Merchant header */}
      <Rise className="flex flex-col items-center border-b border-line px-6 pb-5 pt-6 text-center">
        <span
          role="img"
          aria-label={`${receipt.merchant} logo placeholder`}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--r-dark)] text-lg font-bold text-[var(--r-on-dark)]"
        >
          {merchantInitials(receipt.merchant)}
        </span>
        <h1 className="type-h2 mt-3">{receipt.merchant}</h1>
        <p className="type-small text-ink-muted">{receipt.branch}</p>
        <p className="type-label mt-3 text-[var(--r-primary)]">Receipti Receipt</p>
        <p className="mt-1 text-[0.9375rem] font-bold tracking-wide" data-mono>
          {receipt.id}
        </p>
        <p className="type-caption mt-1 text-ink-muted">
          Transaction <span className="font-semibold" data-mono>{receipt.transactionId}</span>
        </p>
        <p className="type-caption mt-0.5 text-ink-faint tnum">
          {formatDate(receipt.issuedAt)} · {formatTime(receipt.issuedAt)}
        </p>
        <div className="mt-2.5">
          <TxPill state={txState} />
        </div>
      </Rise>

      {/* Total hero */}
      <Rise delay={0.05} className="border-b border-line bg-background/50 px-6 py-5 text-center">
        <p className="type-label text-ink-faint">Total</p>
        <p className="type-amount mt-1 text-4xl tnum" data-numeric aria-label={`Total ${formatMoney(aed(receipt.totalMinor))}`}>
          {formatMoney(aed(receipt.totalMinor))}
        </p>
        <p className="type-small mt-1.5 text-ink-muted">
          {receipt.lines.reduce((n, l) => n + l.quantity, 0)}{" "}
          {receipt.lines.reduce((n, l) => n + l.quantity, 0) === 1 ? "item" : "items"}
          {" · "}Paid via {PAYMENT_METHOD_LABEL[receipt.paymentMethod]} · processed by the merchant
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2" role="list" aria-label="Receipt status">
          <span role="listitem">
            <TxPill state={txState} />
          </span>
          <span role="listitem">
            <VerificationStatusBadge status={receipt.verification} />
          </span>
        </div>
        {refunded > 0 && (
          <dl className="mx-auto mt-4 grid max-w-xs grid-cols-2 gap-2" aria-label="Refund summary">
            <div className="rounded-xl border border-line bg-[var(--r-card)] px-3 py-2">
              <dt className="type-caption text-ink-faint">Refunded</dt>
              <dd className="type-small mt-0.5 font-bold tnum" data-numeric>
                {formatMoney(aed(refunded))}
              </dd>
            </div>
            <div className="rounded-xl border border-line bg-[var(--r-card)] px-3 py-2">
              <dt className="type-caption text-ink-faint">Remaining</dt>
              <dd className="type-small mt-0.5 font-bold tnum" data-numeric>
                {formatMoney(aed(refundableMinorTotal(receipt)))}
              </dd>
            </div>
          </dl>
        )}
      </Rise>

      {/* Items */}
      <Rise delay={0.1} className="px-6 py-5">
        <h2 className="type-label text-ink-faint">
          Items · {receipt.lines.reduce((n, l) => n + l.quantity, 0)}
        </h2>
        <ul className="mt-3 divide-y divide-[var(--r-line)]">
          {receipt.lines.map((line) => (
            <li key={line.sku} className="flex items-center gap-3.5 py-3.5 first:pt-0 last:pb-0">
              <ProductImage media={line.media} productName={line.name} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{line.name}</span>
                {line.variant && (
                  <span className="type-caption mt-0.5 block truncate text-ink-muted">{line.variant}</span>
                )}
                <span className="type-caption mt-0.5 block text-ink-muted tnum">
                  {line.quantity} × {formatMoney(aed(line.unitMinor))}
                  {line.category ? ` · ${line.category}` : ""}
                </span>
                <span className="type-caption block text-ink-faint" data-mono>
                  SKU: {line.sku}
                </span>
              </span>
              <span className="type-small shrink-0 font-semibold tnum" data-numeric>
                {formatMoney(aed(line.lineMinor))}
              </span>
            </li>
          ))}
        </ul>
      </Rise>

      {/* Price breakdown */}
      <Rise delay={0.15} className="border-t border-dashed border-line px-6 py-5">
        <h2 className="sr-only">Price breakdown</h2>
        <dl className="space-y-1.5">
          <div className="flex justify-between">
            <dt className="type-small text-ink-muted">Subtotal</dt>
            <dd className="type-small tnum" data-numeric>{formatMoney(aed(receipt.subtotalMinor))}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="type-small text-ink-muted">Discount</dt>
            <dd className="type-small tnum" data-numeric>{formatMoney(aed(receipt.discountMinor))}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="type-small text-ink-muted">Tax (5% incl.)</dt>
            <dd className="type-small tnum" data-numeric>{formatMoney(aed(receipt.taxMinor))}</dd>
          </div>
          {refunded > 0 && (
            <div className="flex justify-between">
              <dt className="type-small text-ink-muted">Refunded</dt>
              <dd className="type-small tnum" data-numeric>−{formatMoney(aed(refunded))}</dd>
            </div>
          )}
          <div className="flex items-baseline justify-between border-t border-line pt-2.5">
            <dt className="type-small font-semibold">{refunded > 0 ? "Original total" : "Total"}</dt>
            <dd className="type-amount text-xl tnum" data-numeric>
              {formatMoney(aed(receipt.totalMinor))}
            </dd>
          </div>
        </dl>
        {(receipt.refunds ?? []).length > 0 && (
          <ul className="mt-3 space-y-2" aria-label="Linked refund events">
            {receipt.refunds!.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--r-info-muted)]/50 px-3.5 py-2.5">
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-[0.8125rem] font-semibold">
                    <Undo2 className="h-3.5 w-3.5 text-[var(--r-info)]" aria-hidden="true" />
                    {r.label ?? "Refund"}
                  </span>
                  {r.reason && <span className="type-caption mt-0.5 block truncate text-ink-muted">{r.reason}</span>}
                </span>
                <span className="type-small shrink-0 font-semibold tnum" data-numeric>
                  −{formatMoney(aed(r.amountMinor))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Rise>

      {/* QR / reference */}
      <Rise delay={0.2} className="flex items-center gap-4 border-t border-line bg-background/50 px-6 py-5">
        <span className="shrink-0 rounded-xl border border-line bg-white p-2.5">
          {origin ? (
            <QRCode value={receiptUrl} size={88} fgColor="#111111" bgColor="#FFFFFF" aria-label={`QR code linking to receipt ${receipt.reference}`} />
          ) : (
            <span className="flex h-[88px] w-[88px] items-center justify-center text-ink-faint" aria-hidden="true">
              <ScanLine className="h-8 w-8" />
            </span>
          )}
        </span>
        <span className="min-w-0">
          <span className="type-label block text-ink-faint">Receipt reference</span>
          <span className="type-small mt-0.5 block font-bold tracking-wide" data-mono>
            {receipt.reference}
          </span>
          <span className="type-caption mt-1 block text-ink-muted">
            Scan to reopen this receipt or check it against the trusted record.
          </span>
        </span>
      </Rise>

      <div className="flex items-center justify-center gap-2 border-t border-line px-6 py-3.5">
        <Badge tone="success" dot>
          Digital receipt · primary record
        </Badge>
      </div>
    </Card>
  );
}
