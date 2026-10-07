"use client";

import { Check, CircleDashed } from "lucide-react";
import type { PosReceipt } from "@/types/pos";
import { formatDate, formatMoney } from "@/lib/format";
import { aed, receiptTxState } from "@/lib/pos";
import { refundableMinorTotal, refundedMinorTotal } from "@/lib/refunds";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { RefundStatusPill } from "./RefundStatusPill";

/**
 * Refund history + receipt lifecycle timeline.
 * Original events are never rewritten — refunds append as new events.
 */
export function RefundHistory({
  receipt,
  onApprove,
  approvingId,
}: {
  receipt: PosReceipt;
  onApprove: (refundId: string) => void;
  approvingId: string | null;
}) {
  const refunds = receipt.refunds ?? [];
  const refunded = refundedMinorTotal(receipt);
  const remaining = refundableMinorTotal(receipt);
  const txState = receiptTxState(receipt);

  return (
    <div className="flex flex-col gap-4">
      {/* Totals */}
      <dl className="grid grid-cols-3 gap-2" aria-label="Refund totals">
        <div className="rounded-xl bg-background px-3 py-2.5 text-center">
          <dt className="type-caption text-ink-faint">Refunded</dt>
          <dd className="type-small mt-0.5 font-bold tnum" data-numeric>
            {formatMoney(aed(refunded))}
          </dd>
        </div>
        <div className="rounded-xl bg-background px-3 py-2.5 text-center">
          <dt className="type-caption text-ink-faint">Remaining</dt>
          <dd className="type-small mt-0.5 font-bold tnum" data-numeric>
            {formatMoney(aed(remaining))}
          </dd>
        </div>
        <div className="rounded-xl bg-background px-3 py-2.5 text-center">
          <dt className="type-caption text-ink-faint">Events</dt>
          <dd className="type-small mt-0.5 font-bold tnum" data-numeric>
            {refunds.length}
          </dd>
        </div>
      </dl>

      {/* Lifecycle timeline */}
      <ol className="relative flex flex-col gap-0 border-l-2 border-line pl-0" aria-label="Receipt lifecycle">
        <li className="relative flex gap-3 pb-5 pl-5">
          <span aria-hidden="true" className="absolute -left-[9px] top-0.5 h-4 w-4 rounded-full border-2 border-line bg-[var(--r-card)]" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Receipt created</p>
            <p className="type-caption text-ink-muted tnum">
              <span data-mono>{receipt.id}</span> · {formatDate(receipt.issuedAt)}
            </p>
          </div>
        </li>
        <li className="relative flex gap-3 pb-5 pl-5">
          <span aria-hidden="true" className="absolute -left-[9px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--r-primary)] text-white">
            <Check className="h-2.5 w-2.5" strokeWidth={3} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Purchase · Paid</p>
            <p className="type-caption text-ink-muted tnum">
              {formatMoney(aed(receipt.totalMinor))} · {formatDate(receipt.issuedAt)}
            </p>
          </div>
        </li>

        {refunds.map((r) => {
          const status = r.status ?? "COMPLETED";
          const isPending = status === "PENDING";
          return (
            <li key={r.id} className="relative flex gap-3 pb-5 pl-5 last:pb-1">
              <span
                aria-hidden="true"
                className={cn(
                  "absolute -left-[9px] top-0.5 h-4 w-4 rounded-full border-2",
                  status === "COMPLETED" && "border-[var(--r-info)] bg-[var(--r-card)]",
                  status === "FAILED" && "border-[var(--r-danger)] bg-[var(--r-card)]",
                  (isPending || status === "PROCESSING") && "border-[var(--r-warning)] bg-[var(--r-card)]"
                )}
              />
              <div className="min-w-0 flex-1 rounded-xl border border-line px-3.5 py-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">
                    {r.id} · <span className="tnum">{formatMoney(aed(r.amountMinor))}</span>
                  </p>
                  <RefundStatusPill status={status} />
                </div>
                <p className="type-caption mt-1 text-ink-muted">
                  {(r.items ?? []).map((i) => `${i.quantity} × ${i.name}`).join(", ") || r.label || "Refund"}
                  {r.reason ? ` · ${r.reason}` : ""} · <span className="tnum">{formatDate(r.createdAt)}</span>
                </p>
                {isPending && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={approvingId === r.id}
                      onClick={() => onApprove(r.id)}
                    >
                      Approve refund
                    </Button>
                    <span className="type-caption text-ink-faint">Demo control</span>
                  </div>
                )}
              </div>
            </li>
          );
        })}

        <li className="relative flex gap-3 pl-5" aria-current="true">
          <span aria-hidden="true" className="absolute -left-[9px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--r-dark)] text-[var(--r-on-dark)]">
            <CircleDashed className="h-2.5 w-2.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              Current status:{" "}
              {txState === "PAID" ? "Paid" : txState === "REFUNDED" ? "Refunded" : "Partially refunded"}
            </p>
            <p className="type-caption text-ink-muted">
              Original {formatMoney(aed(receipt.totalMinor))} preserved ·{" "}
              {formatMoney(aed(refunded))} refunded
            </p>
          </div>
        </li>
      </ol>
    </div>
  );
}
