"use client";

import Link from "next/link";
import { ReceiptText } from "lucide-react";
import type { PosReceipt } from "@/types/pos";
import { formatDateTime, formatMoney } from "@/lib/format";
import { aed, PAYMENT_METHOD_LABEL, refundedMinorTotal } from "@/lib/pos";
import { customerLabel, deliveryFor, itemCount, txState } from "@/lib/merchant";
import { RefundStatusPill } from "@/components/refunds";
import { Button, Modal, VerificationStatusBadge } from "@/components/ui";
import { DeliveryPill, TxPill } from "./Pills";

/** Transaction detail (§8): full record summary linking to the receipt. */
export function ReceiptDetailDialog({ receipt, onClose }: { receipt: PosReceipt | null; onClose: () => void }) {
  const refunds = receipt?.refunds ?? [];
  return (
    <Modal
      open={receipt !== null}
      onClose={onClose}
      title={receipt ? `Transaction ${receipt.id}` : "Transaction"}
      description={receipt ? `${receipt.merchant} · ${receipt.branch}` : undefined}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {receipt && (
            <Link href={`/receipt/${receipt.reference}`}>
              <Button leftIcon={<ReceiptText className="h-4 w-4" aria-hidden="true" />}>
                View receipt
              </Button>
            </Link>
          )}
        </>
      }
    >
      {receipt && (
        <div className="flex flex-col gap-5">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
            {[
              ["Receipt ID", receipt.id, true],
              ["Transaction ID", receipt.transactionId, true],
              ["Date / time", formatDateTime(receipt.issuedAt), false],
              ["Customer", customerLabel(receipt), false],
              ["Items", `${itemCount(receipt)} items`, false],
              ["Payment method", PAYMENT_METHOD_LABEL[receipt.paymentMethod], false],
            ].map(([term, value, mono]) => (
              <div key={term as string} className="min-w-0">
                <dt className="type-caption text-ink-faint">{term as string}</dt>
                <dd className="type-small mt-0.5 truncate font-semibold" data-mono={mono ? "" : undefined}>
                  {value as string}
                </dd>
              </div>
            ))}
          </dl>

          <div>
            <h3 className="type-label text-ink-faint">Lines</h3>
            <ul className="mt-2 divide-y divide-[var(--r-line)] rounded-xl border border-line">
              {receipt.lines.map((l) => (
                <li key={l.sku} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{l.name}</span>
                    <span className="type-caption block text-ink-muted tnum">
                      {l.quantity} × {formatMoney(aed(l.unitMinor))}
                    </span>
                  </span>
                  <span className="type-small shrink-0 font-semibold tnum" data-numeric>
                    {formatMoney(aed(l.lineMinor))}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-background px-4 py-3 sm:grid-cols-4">
            <div>
              <dt className="type-caption text-ink-faint">Subtotal</dt>
              <dd className="type-small font-semibold tnum" data-numeric>{formatMoney(aed(receipt.subtotalMinor))}</dd>
            </div>
            <div>
              <dt className="type-caption text-ink-faint">Discount</dt>
              <dd className="type-small font-semibold tnum" data-numeric>{formatMoney(aed(receipt.discountMinor))}</dd>
            </div>
            <div>
              <dt className="type-caption text-ink-faint">Tax (incl.)</dt>
              <dd className="type-small font-semibold tnum" data-numeric>{formatMoney(aed(receipt.taxMinor))}</dd>
            </div>
            <div>
              <dt className="type-caption text-ink-faint">Total</dt>
              <dd className="type-small font-bold tnum" data-numeric>{formatMoney(aed(receipt.totalMinor))}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center gap-2">
            <TxPill state={txState(receipt)} />
            <VerificationStatusBadge status={receipt.verification} />
            <DeliveryPill delivery={deliveryFor(receipt.reference)} />
          </div>

          <div>
            <h3 className="type-label text-ink-faint">
              Refunds{refunds.length > 0 ? ` · ${formatMoney(aed(refundedMinorTotal(receipt)))} completed` : ""}
            </h3>
            {refunds.length === 0 ? (
              <p className="type-small mt-2 rounded-xl bg-background px-3.5 py-2.5 text-ink-muted">
                No refund issued for this receipt.
              </p>
            ) : (
              <ul className="mt-2 flex flex-col gap-2">
                {refunds.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 rounded-xl bg-background px-3.5 py-2.5">
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold" data-mono>{r.id}</span>
                      <span className="type-caption block truncate text-ink-muted">
                        {r.reason ?? r.label ?? "Refund"}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="type-small font-semibold tnum" data-numeric>
                        {formatMoney(aed(r.amountMinor))}
                      </span>
                      <RefundStatusPill status={r.status ?? "COMPLETED"} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
