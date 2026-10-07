/* ============================================================
   RECEIPTI — POS transaction engine (Phase 03)
   Pure functions: totals, ids, and receipt assembly.
   When the real API lands, these map 1:1 to backend calls.
   ============================================================ */
import type { Money } from "@/types";
import type {
  CartItem,
  PosPaymentMethod,
  PosReceipt,
  PosTransaction,
} from "@/types/pos";
import { POS_BRANCH, POS_CURRENCY, POS_MERCHANT } from "@/data/pos-catalog";

/** UAE VAT rate used for the inclusive-tax breakdown. */
export const VAT_RATE = 0.05;

export function cartSubtotalMinor(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.product.price.amountMinor * i.quantity, 0);
}

/** Tax portion embedded in a tax-inclusive subtotal. */
export function inclusiveTaxMinor(subtotalMinor: number): number {
  return Math.round(subtotalMinor - subtotalMinor / (1 + VAT_RATE));
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function aed(minor: number): Money {
  return { amountMinor: minor, currency: POS_CURRENCY };
}

const pad = (n: number, len = 3) => String(n).padStart(len, "0");

export function buildTransactionId(seq: number, now = new Date()): string {
  const y = now.getFullYear();
  const m = pad(now.getMonth() + 1, 2);
  const d = pad(now.getDate(), 2);
  return `UT-DXB-${y}${m}${d}-${pad(seq)}`;
}

export function buildReceiptId(seq: number): string {
  return `RCPT-DXB-${pad(seq)}`;
}

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function buildReference(rand: () => number = Math.random): string {
  let s = "";
  for (let i = 0; i < 7; i++) s += REF_ALPHABET[Math.floor(rand() * REF_ALPHABET.length)];
  return `RCP_${s}`;
}

export function createTransaction(
  items: CartItem[],
  paymentMethod: PosPaymentMethod,
  seq: number,
  now = new Date()
): PosTransaction {
  const subtotalMinor = cartSubtotalMinor(items);
  return {
    id: buildTransactionId(seq, now),
    merchant: POS_MERCHANT,
    branch: POS_BRANCH,
    items: items.map((i) => ({ ...i })),
    subtotalMinor,
    discountMinor: 0,
    taxMinor: inclusiveTaxMinor(subtotalMinor),
    totalMinor: subtotalMinor,
    currency: POS_CURRENCY,
    paymentMethod,
    paymentStatus: "UNPAID",
    createdAt: now.toISOString(),
  };
}

export function createReceipt(
  tx: PosTransaction,
  seq: number,
  reference: string,
  now = new Date()
): PosReceipt {
  return {
    id: buildReceiptId(seq),
    transactionId: tx.id,
    reference,
    merchant: tx.merchant,
    branch: tx.branch,
    lines: tx.items.map((i) => ({
      name: i.product.name,
      sku: i.product.sku,
      quantity: i.quantity,
      unitMinor: i.product.price.amountMinor,
      lineMinor: i.product.price.amountMinor * i.quantity,
    })),
    subtotalMinor: tx.subtotalMinor,
    discountMinor: tx.discountMinor,
    taxMinor: tx.taxMinor,
    totalMinor: tx.totalMinor,
    currency: tx.currency,
    paymentMethod: tx.paymentMethod,
    paymentStatus: "PAID",
    receiptState: "READY",
    verification: "VERIFIED",
    issuedAt: now.toISOString(),
  };
}

/**
 * Total COMPLETED refunds (0 when none).
 * Legacy refunds without a status count as COMPLETED.
 * PENDING / PROCESSING / FAILED never move the financial state (Phase 06).
 */
export function refundedMinorTotal(receipt: Pick<PosReceipt, "refunds">): number {
  return (receipt.refunds ?? [])
    .filter((r) => (r.status ?? "COMPLETED") === "COMPLETED")
    .reduce((sum, r) => sum + r.amountMinor, 0);
}

/** Refundable remainder: original total minus completed refunds (never below 0). */
export function refundableMinorTotal(receipt: Pick<PosReceipt, "refunds" | "totalMinor">): number {
  return Math.max(0, receipt.totalMinor - refundedMinorTotal(receipt));
}

/**
 * Customer-facing transaction state, derived from linked refunds.
 * REFUNDED here never implies INVALID — a refunded receipt can be
 * fully authentic (verification is tracked separately).
 */
export function receiptTxState(
  receipt: Pick<PosReceipt, "refunds" | "totalMinor">
): "PAID" | "PARTIALLY_REFUNDED" | "REFUNDED" {
  const refunded = refundedMinorTotal(receipt);
  if (refunded <= 0) return "PAID";
  if (refunded >= receipt.totalMinor) return "REFUNDED";
  return "PARTIALLY_REFUNDED";
}

export const PAYMENT_METHOD_LABEL: Record<PosPaymentMethod, string> = {
  CARD: "Card",
  CASH: "Cash",
  DIGITAL: "Digital payment",
};
