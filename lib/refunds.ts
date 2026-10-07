/* ============================================================
   RECEIPTI — Refund engine (Phase 06)
   Pure functions: eligibility, per-item refundable quantities,
   draft assembly, and validation. Financial state moves only on
   COMPLETED refunds; originals are never mutated (copies out).
   ============================================================ */
import type { PosReceipt, PosRefundEvent, PosRefundItem } from "@/types/pos";
import { refundableMinorTotal, refundedMinorTotal } from "@/lib/pos";

export const REFUND_REASONS = [
  "Wrong item",
  "Damaged item",
  "Changed mind",
  "Duplicate purchase",
  "Other",
] as const;

export type RefundReason = (typeof REFUND_REASONS)[number];

/** Completed-refunded quantity of one SKU (legacy item-less refunds count 0 here). */
function completedQtyForSku(receipt: PosReceipt, sku: string): number {
  return (receipt.refunds ?? [])
    .filter((r) => (r.status ?? "COMPLETED") === "COMPLETED")
    .flatMap((r) => r.items ?? [])
    .filter((i) => i.sku === sku)
    .reduce((s, i) => s + i.quantity, 0);
}

/** Per-line refundable quantities for the selection UI. */
export function refundableLines(receipt: PosReceipt): {
  sku: string;
  name: string;
  unitMinor: number;
  purchased: number;
  refunded: number;
  refundable: number;
}[] {
  return receipt.lines.map((l) => {
    const refunded = Math.min(completedQtyForSku(receipt, l.sku), l.quantity);
    return {
      sku: l.sku,
      name: l.name,
      unitMinor: l.unitMinor,
      purchased: l.quantity,
      refunded,
      refundable: Math.max(0, l.quantity - refunded),
    };
  });
}

/** Next refund id for this receipt (RF-001, RF-002, …). */
export function nextRefundId(receipt: PosReceipt): string {
  const n = (receipt.refunds ?? []).length + 1;
  return `RF-${String(n).padStart(3, "0")}`;
}

export interface RefundSelection {
  sku: string;
  quantity: number;
}

export function selectionAmountMinor(receipt: PosReceipt, selection: RefundSelection[]): number {
  const units = new Map(receipt.lines.map((l) => [l.sku, l.unitMinor]));
  return selection.reduce((s, sel) => s + (units.get(sel.sku) ?? 0) * sel.quantity, 0);
}

export function validateSelection(
  receipt: PosReceipt,
  selection: RefundSelection[]
): { ok: true; amountMinor: number } | { ok: false; error: string } {
  const picked = selection.filter((s) => s.quantity > 0);
  if (picked.length === 0) return { ok: false, error: "Select at least one item to refund." };

  const limits = new Map(refundableLines(receipt).map((l) => [l.sku, l]));
  for (const sel of picked) {
    const line = limits.get(sel.sku);
    if (!line) return { ok: false, error: "One of the selected items is no longer on this receipt." };
    if (sel.quantity > line.refundable) {
      return {
        ok: false,
        error: `Only ${line.refundable} × ${line.name} can still be refunded.`,
      };
    }
  }

  const amountMinor = selectionAmountMinor(receipt, picked);
  if (amountMinor <= 0) return { ok: false, error: "Refund amount must be greater than zero." };
  const refundable = refundableMinorTotal(receipt);
  if (amountMinor > refundable) {
    return { ok: false, error: "Refund amount exceeds the remaining refundable amount." };
  }
  return { ok: true, amountMinor };
}

export function buildRefundEvent(
  receipt: PosReceipt,
  selection: RefundSelection[],
  reason: string,
  now = new Date()
): PosRefundEvent {
  const picked = selection.filter((s) => s.quantity > 0);
  const bySku = new Map(receipt.lines.map((l) => [l.sku, l]));
  const items: PosRefundItem[] = picked.map((sel) => {
    const line = bySku.get(sel.sku)!;
    return { sku: line.sku, name: line.name, quantity: sel.quantity, unitMinor: line.unitMinor };
  });
  const amountMinor = items.reduce((s, i) => s + i.quantity * i.unitMinor, 0);
  return {
    id: nextRefundId(receipt),
    receiptId: receipt.id,
    transactionId: receipt.transactionId,
    amountMinor,
    currency: receipt.currency,
    items,
    reason,
    status: "PENDING",
    createdAt: now.toISOString(),
    label: amountMinor >= refundableMinorTotal(receipt) ? "Full refund" : "Partial refund",
  };
}

/** Return a copy of the receipt with the refund appended (original untouched). */
export function appendRefund(receipt: PosReceipt, refund: PosRefundEvent): PosReceipt {
  return { ...receipt, refunds: [...(receipt.refunds ?? []), refund] };
}

/** Return a copy with one refund's status updated (sets processedAt when done). */
export function updateRefundStatus(
  receipt: PosReceipt,
  refundId: string,
  status: PosRefundEvent["status"],
  now = new Date()
): PosReceipt {
  return {
    ...receipt,
    refunds: (receipt.refunds ?? []).map((r) =>
      r.id === refundId
        ? { ...r, status, processedAt: status === "COMPLETED" ? now.toISOString() : r.processedAt }
        : r
    ),
  };
}

export { refundableMinorTotal, refundedMinorTotal };
