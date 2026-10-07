"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, Minus, Plus } from "lucide-react";
import type { PosReceipt } from "@/types/pos";
import { formatMoney } from "@/lib/format";
import { aed, receiptTxState } from "@/lib/pos";
import { saveReceipt } from "@/lib/pos-store";
import { pushNotifyEvent } from "@/lib/notify";
import {
  appendRefund,
  buildRefundEvent,
  nextRefundId,
  REFUND_REASONS,
  refundableLines,
  refundableMinorTotal,
  refundedMinorTotal,
  selectionAmountMinor,
  validateSelection,
  type RefundSelection,
} from "@/lib/refunds";
import { Button, IconButton, Modal, Select, useToast } from "@/components/ui";
import { useReducedMotion } from "@/lib/motion";
import { RefundStatusPill } from "./RefundStatusPill";

type Step = "select" | "review" | "pending";

const STEP_TITLES: Record<Step, string> = {
  select: "Select items to refund",
  review: "Review refund",
  pending: "Refund requested",
};

export function RefundWizard({
  receipt,
  open,
  onClose,
  onComplete,
}: {
  receipt: PosReceipt;
  open: boolean;
  onClose: () => void;
  /** Called with the persisted receipt whenever its refund state changes. */
  onComplete: (updated: PosReceipt) => void;
}) {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [step, setStep] = React.useState<Step>("select");
  const [qty, setQty] = React.useState<Record<string, number>>({});
  const [reason, setReason] = React.useState<string>(REFUND_REASONS[0]!);
  const [error, setError] = React.useState<string | null>(null);
  const [draftId, setDraftId] = React.useState<string | null>(null);
  const [working, setWorking] = React.useState<PosReceipt>(receipt);

  const lines = React.useMemo(() => refundableLines(working), [working]);
  const selection: RefundSelection[] = lines.map((l) => ({ sku: l.sku, quantity: qty[l.sku] ?? 0 }));
  const amount = selectionAmountMinor(working, selection);
  const alreadyRefunded = refundedMinorTotal(working);
  const refundable = refundableMinorTotal(working);

  // Reset whenever the wizard opens for a (possibly new) receipt.
  React.useEffect(() => {
    if (!open) return;
    setStep("select");
    setQty({});
    setReason(REFUND_REASONS[0]!);
    setError(null);
    setDraftId(null);
    setWorking(receipt);
  }, [open, receipt]);

  const persist = (updated: PosReceipt) => {
    saveReceipt(updated);
    setWorking(updated);
    onComplete(updated);
  };

  const goReview = () => {
    const v = validateSelection(working, selection);
    if (!v.ok) {
      setError(v.error);
      return;
    }
    setError(null);
    setStep("review");
  };

  const confirm = () => {
    const v = validateSelection(working, selection);
    if (!v.ok) {
      setError(v.error);
      setStep("select");
      return;
    }
    const draft = buildRefundEvent(working, selection, reason);
    const withDraft = appendRefund(working, draft);
    persist(withDraft);
    setDraftId(draft.id);
    setStep("pending");
    pushNotifyEvent({
      kind: "refund-requested",
      title: `Refund requested · ${formatMoney(aed(draft.amountMinor))}`,
      detail: `${working.merchant} · ${working.id} · ${draft.id}`,
      href: `/receipt/${working.reference}#refunds`,
    });
    toast({ title: "Refund requested", description: `${draft.id} is pending merchant approval.`, tone: "info" });
  };

  const setLineQty = (sku: string, max: number, next: number) => {
    setQty((prev) => ({ ...prev, [sku]: Math.max(0, Math.min(max, next)) }));
    if (error) setError(null);
  };

  const txLabel =
    receiptTxState(working) === "PAID"
      ? "Paid"
      : receiptTxState(working) === "REFUNDED"
        ? "Refunded"
        : "Partially refunded";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={STEP_TITLES[step]}
      description={
        step === "select"
          ? `Receipt ${working.id} · ${formatMoney(aed(refundable))} still refundable`
          : `Receipt ${working.id} · linked event ${draftId ?? nextRefundId(working)}`
      }
      size="md"
      footer={
        step === "select" ? (
          <>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={goReview} disabled={amount <= 0}>
              Review refund · {formatMoney(aed(amount))}
            </Button>
          </>
        ) : step === "review" ? (
          <>
            <Button variant="outline" onClick={() => setStep("select")} leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}>
              Back
            </Button>
            <Button onClick={confirm}>Request refund · {formatMoney(aed(amount))}</Button>
          </>
        ) : step === "pending" ? (
          <Button onClick={onClose} className="w-full sm:w-auto">Done</Button>
        ) : undefined
      }
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={reduce ? false : { opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? undefined : { opacity: 0, x: -12 }}
          transition={{ duration: 0.18 }}
        >
          {step === "select" && (
            <div className="flex flex-col gap-3">
              <p className="type-small rounded-xl bg-background px-3.5 py-2.5 text-ink-muted">
                Choose what goes back. The merchant reviews and approves the request —
                the original receipt is never altered.
              </p>
              <ul className="flex flex-col gap-2.5" aria-label="Refundable items">
                {lines.map((l) => {
                  const picked = qty[l.sku] ?? 0;
                  const noneLeft = l.refundable === 0;
                  return (
                    <li
                      key={l.sku}
                      className="flex items-center gap-3 rounded-xl border border-line px-3.5 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{l.name}</p>
                        <p className="type-caption mt-0.5 text-ink-muted tnum">
                          {formatMoney(aed(l.unitMinor))} each · {l.refundable} of {l.purchased} refundable
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1" role="group" aria-label={`Refund quantity for ${l.name}`}>
                        <IconButton
                          label={`Remove one ${l.name} from refund`}
                          size="sm"
                          variant="outline"
                          disabled={picked === 0}
                          onClick={() => setLineQty(l.sku, l.refundable, picked - 1)}
                        >
                          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                        </IconButton>
                        <span className="w-7 text-center text-sm font-bold tnum" aria-label={`${picked} selected`}>
                          {picked}
                        </span>
                        <IconButton
                          label={`Add one ${l.name} to refund`}
                          size="sm"
                          variant="outline"
                          disabled={picked >= l.refundable || noneLeft}
                          onClick={() => setLineQty(l.sku, l.refundable, picked + 1)}
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        </IconButton>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <Select
                label="Reason for return"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                options={REFUND_REASONS.map((r) => ({ value: r, label: r }))}
              />
              {error && (
                <p role="alert" className="flex items-start gap-2 rounded-xl bg-[var(--r-danger-muted)] px-3.5 py-2.5 text-sm font-medium text-[var(--r-danger)]">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {error}
                </p>
              )}
            </div>
          )}

          {step === "review" && (
            <dl className="space-y-2">
              {(
                [
                  ["Original amount", formatMoney(aed(working.totalMinor))],
                  ["Already refunded", formatMoney(aed(alreadyRefunded))],
                  ["New refund", formatMoney(aed(amount))],
                  ["Total refunded after approval", formatMoney(aed(alreadyRefunded + amount))],
                  ["Remaining after approval", formatMoney(aed(Math.max(0, refundable - amount)))],
                ] as const
              ).map(([label, value], i, arr) => (
                <div
                  key={label}
                  className={
                    i === arr.length - 1
                      ? "flex justify-between border-t border-line pt-2"
                      : "flex justify-between"
                  }
                >
                  <dt className="type-small text-ink-muted">{label}</dt>
                  <dd className="type-small font-semibold tnum" data-numeric>{value}</dd>
                </div>
              ))}
              <div className="mt-1 rounded-xl bg-background px-3.5 py-2.5">
                <p className="type-caption text-ink-faint">
                  {selection.filter((s) => s.quantity > 0).map((s) => {
                    const l = lines.find((x) => x.sku === s.sku)!;
                    return `${s.quantity} × ${l.name}`;
                  }).join(" · ")}
                  {" · "}{reason}
                </p>
              </div>
              <p className="type-caption text-ink-faint">
                Requesting sends event {draftId ?? nextRefundId(working)} to the merchant for approval.
              </p>
            </dl>
          )}

          {step === "pending" && (
            <div className="flex flex-col items-center py-6 text-center">
              <RefundStatusPill status="PENDING" />
              <p className="type-h3 mt-3">Refund requested</p>
              <p className="type-small mt-1.5 max-w-xs text-ink-muted">
                {draftId} · {formatMoney(aed(amount))} is waiting for the merchant.
                The receipt stays <strong className="text-ink">{txLabel}</strong> until
                it is approved — nothing moves until then.
              </p>
              <div className="mt-5 grid w-full gap-2 sm:grid-cols-2">
                <Link href="/customer/refunds">
                  <Button variant="outline" className="w-full">Track in My refunds</Button>
                </Link>
                <Link href="/merchant/refunds">
                  <Button className="w-full">Approve as merchant</Button>
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </Modal>
  );
}
