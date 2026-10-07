import type { Money } from "@/types";
import { LIVE_CURRENCY, LIVE_DEFAULT_TAX_PCT } from "@/data/live-catalog";

export type LivePayMethod = "CASH" | "CARD" | "JAZZCASH" | "EASYPaisa" | "BANK";
/** open = billing · ready = bill locked, merchant collecting payment · paid = confirmed. */
export type LiveTxStatus = "open" | "ready" | "paid";
export type LiveDiscountType = "percent" | "flat";
export type LiveSyncMode = "local" | "remote";
export type LiveClaimMethod = "qr" | "nfc" | "wallet";

export interface LiveDiscount {
  type: LiveDiscountType;
  /** Percent (0–100) when type is "percent", minor units when "flat". */
  value: number;
}

export interface LiveLine {
  productId: string;
  /** Variant SKU — unique per size × colour. */
  sku: string;
  name: string;
  size: string;
  colour: string;
  image: string;
  unitMinor: number;
  quantity: number;
  /** Last add / quantity / variant change — drives the "just scanned" highlight. */
  updatedAt: number;
}

/**
 * Finalized receipt. Issued exactly once when the merchant confirms payment;
 * claimed at most once, through whichever handoff the customer picks.
 * The claim token is opaque — it carries no customer information.
 */
export interface LiveReceipt {
  reference: string;
  claimToken: string;
  issuedAt: string;
  claimedAt: string | null;
  claimMethod: LiveClaimMethod | null;
}

export interface LiveTransaction {
  id: string;
  status: LiveTxStatus;
  lines: LiveLine[];
  discount: LiveDiscount;
  /** Configurable demo tax rate (percent), applied exclusive on the net amount. */
  taxPct: number;
  method: LivePayMethod;
  receipt: LiveReceipt | null;
  createdAt: string;
  paidAt: string | null;
  /** Monotonic revision — incoming sync payloads apply only when newer. */
  rev: number;
}

export interface LiveTotals {
  count: number;
  subtotalMinor: number;
  discountMinor: number;
  netMinor: number;
  taxMinor: number;
  totalMinor: number;
}

const TX_KEY = "receipti.live.txn.v1";
const SEQ_KEY = "receipti.live.seq.v1";
export const LIVE_EVENT = "receipti:live";
export const LIVE_CHANNEL = "receipti-live-txn";

export const pkr = (amountMinor: number): Money => ({ amountMinor, currency: LIVE_CURRENCY });

export const LIVE_METHOD_LABEL: Record<LivePayMethod, string> = {
  CASH: "Cash",
  CARD: "Debit/Credit Card",
  JAZZCASH: "JazzCash",
  EASYPaisa: "Easypaisa",
  BANK: "Bank Transfer",
};

export const LIVE_CLAIM_LABEL: Record<LiveClaimMethod, string> = {
  qr: "QR code",
  nfc: "NFC tap",
  wallet: "Receipti Wallet",
};

/** True when Supabase Realtime credentials are configured for cross-device sync. */
export function isRemoteSyncConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function pad(n: number, w = 6): string {
  return String(n).padStart(w, "0");
}

function canStore(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(length: number, rand: () => number = Math.random): string {
  let s = "";
  for (let i = 0; i < length; i++) s += REF_ALPHABET[Math.floor(rand() * REF_ALPHABET.length)];
  return s;
}

export function buildLiveReference(rand?: () => number): string {
  return `RCP_${randomCode(7, rand)}`;
}

export function buildClaimToken(rand?: () => number): string {
  return `CLM_${randomCode(12, rand)}`;
}

export function liveTotals(tx: Pick<LiveTransaction, "lines" | "discount" | "taxPct">): LiveTotals {
  const count = tx.lines.reduce((n, l) => n + l.quantity, 0);
  const subtotalMinor = tx.lines.reduce((s, l) => s + l.unitMinor * l.quantity, 0);
  const discountMinor =
    tx.discount.type === "percent"
      ? Math.round((subtotalMinor * Math.min(100, Math.max(0, tx.discount.value))) / 100)
      : Math.min(subtotalMinor, Math.max(0, Math.round(tx.discount.value)));
  const netMinor = subtotalMinor - discountMinor;
  const taxMinor = Math.round((netMinor * Math.max(0, tx.taxPct)) / 100);
  return { count, subtotalMinor, discountMinor, netMinor, taxMinor, totalMinor: netMinor + taxMinor };
}

/**
 * Investor-facing transaction lifecycle, derived from the stored engine state
 * (status + receipt + claim) — one source of truth, no duplicated status.
 * PAYMENT_CONFIRMED and RECEIPT_ISSUED complete together: the receipt issues
 * atomically the moment payment confirms, so double-confirmation is impossible.
 */
export type LiveLifecycleStage =
  | "CREATED"
  | "ITEMS_ADDED"
  | "CHECKOUT"
  | "PAYMENT_CONFIRMED"
  | "RECEIPT_ISSUED"
  | "RECEIPT_CLAIMED";

export const LIVE_LIFECYCLE_ORDER: LiveLifecycleStage[] = [
  "CREATED",
  "ITEMS_ADDED",
  "CHECKOUT",
  "PAYMENT_CONFIRMED",
  "RECEIPT_ISSUED",
  "RECEIPT_CLAIMED",
];

export function liveLifecycleStage(
  tx: Pick<LiveTransaction, "status" | "lines" | "receipt">
): LiveLifecycleStage {
  if (tx.status === "paid") {
    if (!tx.receipt) return "PAYMENT_CONFIRMED";
    return tx.receipt.claimedAt ? "RECEIPT_CLAIMED" : "RECEIPT_ISSUED";
  }
  if (tx.status === "ready") return "CHECKOUT";
  return tx.lines.length > 0 ? "ITEMS_ADDED" : "CREATED";
}

export function liveDiscountLabel(d: LiveDiscount): string {
  return d.type === "percent" ? `${d.value}%` : "Flat";
}

export function nextLiveSequence(): number {
  if (!canStore()) return 1;
  const next = Number(window.localStorage.getItem(SEQ_KEY) ?? "41") + 1;
  try {
    window.localStorage.setItem(SEQ_KEY, String(next));
  } catch {
    /* sequence is best-effort */
  }
  return next;
}

export function newLiveTransaction(seq: number, now = new Date()): LiveTransaction {
  return {
    id: `TXN-${pad(seq)}`,
    status: "open",
    lines: [],
    discount: { type: "percent", value: 0 },
    taxPct: LIVE_DEFAULT_TAX_PCT,
    method: "CASH",
    receipt: null,
    createdAt: now.toISOString(),
    paidAt: null,
    rev: 0,
  };
}

interface LegacyStored {
  id?: string;
  lines?: LiveLine[];
  discountPct?: number;
  [k: string]: unknown;
}

function validStatus(s: unknown): LiveTxStatus {
  return s === "open" || s === "ready" || s === "paid" ? s : "open";
}

export function loadLiveTransaction(fallbackSeq = 42): LiveTransaction {
  if (canStore()) {
    try {
      const raw = window.localStorage.getItem(TX_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LiveTransaction & LegacyStored;
        if (parsed && typeof parsed.id === "string" && Array.isArray(parsed.lines)) {
          const discount: LiveDiscount =
            parsed.discount && typeof parsed.discount === "object" && "type" in parsed.discount
              ? (parsed.discount as LiveDiscount)
              : { type: "percent", value: parsed.discountPct ?? 0 };
          return {
            ...newLiveTransaction(fallbackSeq),
            ...parsed,
            status: validStatus(parsed.status),
            // Drop lines from older catalog shapes — the demo catalog changed.
            lines: parsed.lines.filter((l) => l && typeof l.productId === "string" && typeof l.sku === "string"),
            discount,
            taxPct: typeof parsed.taxPct === "number" ? parsed.taxPct : LIVE_DEFAULT_TAX_PCT,
            receipt: parsed.receipt && typeof parsed.receipt === "object" ? (parsed.receipt as LiveReceipt) : null,
            rev: typeof parsed.rev === "number" ? parsed.rev : 0,
          };
        }
      }
    } catch {
      /* fall through to a fresh transaction */
    }
  }
  return newLiveTransaction(fallbackSeq);
}

/** Persist + notify every mounted screen (same tab and other tabs). */
export function saveLiveTransaction(tx: LiveTransaction): void {
  if (!canStore()) return;
  try {
    window.localStorage.setItem(TX_KEY, JSON.stringify(tx));
  } catch {
    /* transaction still updates in-memory */
  }
  window.dispatchEvent(new Event(LIVE_EVENT));
}
