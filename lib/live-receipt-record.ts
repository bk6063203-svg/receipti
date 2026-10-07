import { LIVE_BRANCH, LIVE_MERCHANT, LIVE_MERCHANT_ID } from "@/data/live-catalog";
import type { LiveClaimMethod, LivePayMethod, LiveTransaction } from "./live-transaction";
import { liveTotals } from "./live-transaction";
import { getRepository } from "./receipt-repo";

/**
 * Receipti receipt database — record model.
 *
 * ONE finalized record is created per confirmed payment. Corrections and
 * refunds never overwrite it; they land as separate audit events while the
 * original commercial core stays byte-identical (see `integrity`).
 */

export type ReceiptStatus = "VALID" | "PARTIAL" | "REFUNDED" | "VOIDED";
export type PaymentStatus = "PAID" | "PARTIALLY_REFUNDED" | "REFUNDED" | "VOIDED";

export interface ReceiptLine {
  productId: string;
  sku: string;
  name: string;
  size: string;
  colour: string;
  image: string;
  unitMinor: number;
  quantity: number;
}

export interface ReceiptRecord {
  receiptId: string;
  merchantId: string;
  merchantName: string;
  transactionId: string;
  /** Purchase/transaction time. */
  createdAt: string;
  /** Receipt creation timestamp (set when payment is confirmed). */
  issuedAt: string;
  lines: ReceiptLine[];
  currency: "PKR";
  subtotalMinor: number;
  discountMinor: number;
  discountLabel: string;
  taxMinor: number;
  taxPct: number;
  totalMinor: number;
  refundedMinor: number;
  method: LivePayMethod;
  paymentStatus: PaymentStatus;
  receiptStatus: ReceiptStatus;
  customerId: string | null;
  /** Opaque claim token — the only thing the QR code carries. Never PII. */
  claimToken: string;
  claimMethod: LiveClaimMethod | null;
  claimedAt: string | null;
  /** "sha256:<hex>" over the immutable commercial core (see receiptCore). */
  integrity: string;
  rev: number;
}

/** Wallet visibility is a SEPARATE record — removing it never touches the receipt. */
export interface WalletEntry {
  customerId: string;
  receiptId: string;
  addedAt: string;
  hidden: boolean;
}

export type VerifyResult = "VERIFIED" | "PARTIAL" | "REFUNDED" | "VOIDED" | "NOT_FOUND" | "FAILED";

export interface VerifyEvent {
  id: string;
  receiptId: string;
  result: VerifyResult;
  source: "manual" | "qr";
  at: string;
}

export type AuditType = "ISSUED" | "CLAIMED" | "REFUND" | "VOID";

export interface AuditEvent {
  id: string;
  receiptId: string;
  type: AuditType;
  detail: string;
  amountMinor: number | null;
  actor: "merchant" | "customer" | "system";
  at: string;
}

/** Public verification facts — deliberately excludes customer, token, lines, method. */
export interface VerifyPayload {
  receiptId: string;
  merchantName: string;
  issuedAt: string;
  totalMinor: number;
  itemCount: number;
  status: ReceiptStatus;
  integrityOk: boolean;
}

export const LIVE_DEMO_CUSTOMER_ID = "customer-demo-01";
export const LIVE_DEMO_CUSTOMER_NAME = "Demo Customer";

/** Immutable commercial core — the only fields covered by the integrity hash. */
function receiptCore(r: Pick<ReceiptRecord, "receiptId" | "merchantId" | "transactionId" | "lines" | "subtotalMinor" | "discountMinor" | "taxMinor" | "totalMinor" | "method" | "issuedAt">) {
  return {
    receiptId: r.receiptId,
    merchantId: r.merchantId,
    transactionId: r.transactionId,
    lines: r.lines.map((l) => [l.sku, l.quantity, l.unitMinor]),
    subtotalMinor: r.subtotalMinor,
    discountMinor: r.discountMinor,
    taxMinor: r.taxMinor,
    totalMinor: r.totalMinor,
    method: r.method,
    issuedAt: r.issuedAt,
  };
}

function fnv1aHex(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export async function computeIntegrity(
  r: Parameters<typeof receiptCore>[0]
): Promise<string> {
  const canonical = JSON.stringify(receiptCore(r));
  try {
    const digest = await globalThis.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(canonical)
    );
    const hex = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return `sha256:${hex}`;
  } catch {
    // Non-secure contexts only — honestly labeled as the weaker fallback.
    return `fnv1a:${fnv1aHex(canonical)}`;
  }
}

export async function verifyIntegrity(r: ReceiptRecord): Promise<boolean> {
  return (await computeIntegrity(r)) === r.integrity;
}

export function publicVerifyPayload(r: ReceiptRecord, integrityOk: boolean): VerifyPayload {
  return {
    receiptId: r.receiptId,
    merchantName: r.merchantName,
    issuedAt: r.issuedAt,
    totalMinor: r.totalMinor,
    itemCount: r.lines.reduce((n, l) => n + l.quantity, 0),
    status: r.receiptStatus,
    integrityOk,
  };
}

function discountLabelOf(tx: LiveTransaction): string {
  return tx.discount.type === "percent" ? `${tx.discount.value}%` : "Flat";
}

export async function buildReceiptRecord(tx: LiveTransaction): Promise<ReceiptRecord | null> {
  if (tx.status !== "paid" || !tx.receipt || !tx.paidAt) return null;
  const totals = liveTotals(tx);
  const base = {
    receiptId: tx.receipt.reference,
    merchantId: LIVE_MERCHANT_ID,
    merchantName: LIVE_MERCHANT,
    transactionId: tx.id,
    createdAt: tx.createdAt,
    issuedAt: tx.receipt.issuedAt,
    lines: tx.lines.map((l) => ({
      productId: l.productId,
      sku: l.sku,
      name: l.name,
      size: l.size,
      colour: l.colour,
      image: l.image,
      unitMinor: l.unitMinor,
      quantity: l.quantity,
    })),
    currency: "PKR" as const,
    subtotalMinor: totals.subtotalMinor,
    discountMinor: totals.discountMinor,
    discountLabel: discountLabelOf(tx),
    taxMinor: totals.taxMinor,
    taxPct: tx.taxPct,
    totalMinor: totals.totalMinor,
    refundedMinor: 0,
    method: tx.method,
    paymentStatus: "PAID" as const,
    receiptStatus: "VALID" as const,
    customerId: null,
    claimToken: tx.receipt.claimToken,
    claimMethod: null,
    claimedAt: null,
    rev: 1,
  };
  return { ...base, integrity: await computeIntegrity(base) };
}

/** Persist the finalized record + ISSUED audit event. Fire-and-forget safe. */
export async function persistIssuedReceipt(tx: LiveTransaction): Promise<void> {
  try {
    const record = await buildReceiptRecord(tx);
    if (!record) return;
    const repo = await getRepository();
    const existing = await repo.getReceipt(record.receiptId);
    if (existing) return;
    await repo.saveReceipt(record);
    await repo.appendAudit({
      receiptId: record.receiptId,
      type: "ISSUED",
      detail: `Receipt issued for ${record.transactionId} · ${record.merchantName}`,
      amountMinor: record.totalMinor,
      actor: "system",
    });
  } catch (err) {
    console.warn("[live-db] persistIssuedReceipt failed", err);
  }
}

/** Record the customer's claim (ownership + wallet entry + audit). First claim wins. */
export async function persistClaimedReceipt(
  receiptId: string,
  customerId: string,
  method: LiveClaimMethod,
  methodLabel: string
): Promise<void> {
  try {
    const repo = await getRepository();
    const record = await repo.setClaim(receiptId, customerId, method);
    if (!record) return;
    await repo.appendAudit({
      receiptId,
      type: "CLAIMED",
      detail: `Claimed via ${methodLabel}`,
      amountMinor: null,
      actor: "customer",
    });
  } catch (err) {
    console.warn("[live-db] persistClaimedReceipt failed", err);
  }
}

export { LIVE_BRANCH, LIVE_MERCHANT };
