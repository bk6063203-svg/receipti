/* ============================================================
   RECEIPTI — Merchant dashboard selectors (Phase 09)
   Every metric, table, and chart derives from the canonical
   demo receipts (+ this device's POS records). No second ledger.
   ============================================================ */
import { DEMO_RECEIPTS } from "@/data/pos-demo-receipts";
import { DELIVERY_BY_REFERENCE, VERIFICATION_EVENTS, merchantIdForName } from "@/data/merchant-demo";
import { withResolvedMedia } from "@/lib/pos-media";
import { PAYMENT_METHOD_LABEL, receiptTxState, refundedMinorTotal } from "@/lib/pos";
import type {
  PosPaymentMethod,
  PosReceipt,
  PosRefundEvent,
  PosVerificationState,
  ReceiptTxState,
} from "@/types/pos";
import type { DeliveryInfo, VerificationEvent } from "@/types/merchant";

export { PAYMENT_METHOD_LABEL };

const DUBAI_TZ = "Asia/Dubai";
const DAY = 86_400_000;

/** Calendar day of an instant in the demo's home timezone (YYYY-MM-DD). */
export function dayKey(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: DUBAI_TZ });
}

export function todayKey(now: Date = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: DUBAI_TZ });
}

/**
 * Canonical receipts for one merchant: seeds overlaid with this
 * device's POS-created records (stored wins by reference, as the
 * receipt loader does), newest first.
 */
export function receiptsForMerchant(merchantId: string, stored: PosReceipt[]): PosReceipt[] {
  const byRef = new Map<string, PosReceipt>();
  for (const r of DEMO_RECEIPTS) {
    if (merchantIdForName(r.merchant) === merchantId) byRef.set(r.reference, r);
  }
  for (const r of stored) {
    if (merchantIdForName(r.merchant) === merchantId) byRef.set(r.reference, r);
  }
  return [...byRef.values()]
    .map(withResolvedMedia)
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
}

export function deliveryFor(reference: string): DeliveryInfo {
  return DELIVERY_BY_REFERENCE[reference] ?? { status: "PENDING" };
}

export function eventsForMerchant(merchantId: string): VerificationEvent[] {
  return VERIFICATION_EVENTS.filter((e) => e.merchantId === merchantId).sort((a, b) =>
    b.requestedAt.localeCompare(a.requestedAt)
  );
}

export function customerLabel(receipt: PosReceipt): string {
  return receipt.customerName ?? "Walk-in customer";
}

export function itemCount(receipt: PosReceipt): number {
  return receipt.lines.reduce((n, l) => n + l.quantity, 0);
}

/** Net kept by the merchant: total minus completed refunds. */
export function netMinor(receipt: PosReceipt): number {
  return Math.max(0, receipt.totalMinor - refundedMinorTotal(receipt));
}

export function txState(receipt: PosReceipt): ReceiptTxState {
  return receiptTxState(receipt);
}

/* ---------------- metrics ---------------- */

export interface DashboardMetrics {
  todaySalesMinor: number;
  receiptsToday: number;
  receiptsTotal: number;
  refundsTodayMinor: number;
  pendingRefunds: number;
  completedRefunds: number;
  verification: { requests: number; verified: number; mismatch: number; notFound: number; unavailable: number };
  /** Last-7-days receipt count vs the prior 7 days; null when incomparable. */
  receiptsTrendPct: number | null;
}

export function dashboardMetrics(receipts: PosReceipt[], events: VerificationEvent[]): DashboardMetrics {
  const today = todayKey();
  const todayStart = new Date(`${today}T00:00:00+04:00`).getTime();
  const inLast7 = (iso: string) => new Date(iso).getTime() >= todayStart - 6 * DAY;
  const inPrior7 = (iso: string) => {
    const t = new Date(iso).getTime();
    return t >= todayStart - 13 * DAY && t < todayStart - 6 * DAY;
  };

  let todaySalesMinor = 0;
  let receiptsToday = 0;
  let last7 = 0;
  let prior7 = 0;
  let refundsTodayMinor = 0;
  let pendingRefunds = 0;
  let completedRefunds = 0;

  for (const r of receipts) {
    if (dayKey(r.issuedAt) === today) {
      todaySalesMinor += r.totalMinor;
      receiptsToday += 1;
    }
    if (inLast7(r.issuedAt)) last7 += 1;
    if (inPrior7(r.issuedAt)) prior7 += 1;
    for (const refund of r.refunds ?? []) {
      const status = refund.status ?? "COMPLETED";
      if (status === "COMPLETED") {
        completedRefunds += 1;
        if (dayKey(refund.createdAt) === today) refundsTodayMinor += refund.amountMinor;
      } else if (status === "PENDING" || status === "PROCESSING") {
        pendingRefunds += 1;
      }
    }
  }

  const verification = { requests: events.length, verified: 0, mismatch: 0, notFound: 0, unavailable: 0 };
  for (const e of events) {
    if (e.result === "VERIFIED") verification.verified += 1;
    else if (e.result === "MISMATCH") verification.mismatch += 1;
    else if (e.result === "NOT_FOUND") verification.notFound += 1;
    else verification.unavailable += 1;
  }

  return {
    todaySalesMinor,
    receiptsToday,
    receiptsTotal: receipts.length,
    refundsTodayMinor,
    pendingRefunds,
    completedRefunds,
    verification,
    receiptsTrendPct: prior7 > 0 ? Math.round(((last7 - prior7) / prior7) * 1000) / 10 : null,
  };
}

export interface WeekBucket {
  key: string;
  label: string;
  count: number;
  totalMinor: number;
}

/** Seven daily buckets ending today (oldest first) for the mini chart. */
export function weekBuckets(receipts: PosReceipt[], now: Date = new Date()): WeekBucket[] {
  const buckets: WeekBucket[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * DAY);
    const key = d.toLocaleDateString("en-CA", { timeZone: DUBAI_TZ });
    buckets.push({
      key,
      label: d.toLocaleDateString("en-GB", { weekday: "short", timeZone: DUBAI_TZ }),
      count: 0,
      totalMinor: 0,
    });
  }
  const byKey = new Map(buckets.map((b) => [b.key, b]));
  for (const r of receipts) {
    const b = byKey.get(dayKey(r.issuedAt));
    if (b) {
      b.count += 1;
      b.totalMinor += r.totalMinor;
    }
  }
  return buckets;
}

/* ---------------- refunds ---------------- */

export interface RefundRow {
  refund: PosRefundEvent;
  receipt: PosReceipt;
}

export function refundRows(receipts: PosReceipt[]): RefundRow[] {
  const rows: RefundRow[] = [];
  for (const receipt of receipts) {
    for (const refund of receipt.refunds ?? []) rows.push({ refund, receipt });
  }
  return rows.sort((a, b) => b.refund.createdAt.localeCompare(a.refund.createdAt));
}

/* ---------------- payment lens ---------------- */

export interface MethodTotal {
  method: PosPaymentMethod;
  label: string;
  count: number;
  grossMinor: number;
}

export function methodTotals(receipts: PosReceipt[]): MethodTotal[] {
  const order: PosPaymentMethod[] = ["CARD", "CASH", "DIGITAL"];
  return order
    .map((method) => {
      const mine = receipts.filter((r) => r.paymentMethod === method);
      return {
        method,
        label: PAYMENT_METHOD_LABEL[method],
        count: mine.length,
        grossMinor: mine.reduce((s, r) => s + r.totalMinor, 0),
      };
    })
    .filter((m) => m.count > 0);
}

/* ---------------- search / filter / sort / paginate ---------------- */

export interface ReceiptFilters {
  q: string;
  tx: "ALL" | ReceiptTxState;
  payment: "ALL" | PosPaymentMethod;
  verification: "ALL" | PosVerificationState;
  refund: "ALL" | "NONE" | "PENDING" | "COMPLETED" | "FAILED";
  date: "ALL" | "TODAY" | "7D";
  sort: "NEWEST" | "OLDEST" | "AMOUNT_DESC" | "AMOUNT_ASC";
}

export const DEFAULT_FILTERS: ReceiptFilters = {
  q: "",
  tx: "ALL",
  payment: "ALL",
  verification: "ALL",
  refund: "ALL",
  date: "ALL",
  sort: "NEWEST",
};

function matchesRefund(receipt: PosReceipt, want: ReceiptFilters["refund"]): boolean {
  const refunds = receipt.refunds ?? [];
  if (want === "ALL") return true;
  if (want === "NONE") return refunds.length === 0;
  return refunds.some((r) => {
    const s = r.status ?? "COMPLETED";
    if (want === "PENDING") return s === "PENDING" || s === "PROCESSING";
    return s === want;
  });
}

export function filterReceipts(receipts: PosReceipt[], f: ReceiptFilters): PosReceipt[] {
  const q = f.q.trim().toLowerCase();
  const today = todayKey();
  const weekAgo = new Date(`${today}T00:00:00+04:00`).getTime() - 6 * DAY;

  const rows = receipts.filter((r) => {
    if (f.tx !== "ALL" && receiptTxState(r) !== f.tx) return false;
    if (f.payment !== "ALL" && r.paymentMethod !== f.payment) return false;
    if (f.verification !== "ALL" && r.verification !== f.verification) return false;
    if (!matchesRefund(r, f.refund)) return false;
    if (f.date === "TODAY" && dayKey(r.issuedAt) !== today) return false;
    if (f.date === "7D" && new Date(r.issuedAt).getTime() < weekAgo) return false;
    if (q) {
      const hay = [
        r.id,
        r.transactionId,
        r.reference,
        customerLabel(r),
        ...r.lines.map((l) => `${l.name} ${l.sku}`),
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const by = {
    NEWEST: (a: PosReceipt, b: PosReceipt) => b.issuedAt.localeCompare(a.issuedAt),
    OLDEST: (a: PosReceipt, b: PosReceipt) => a.issuedAt.localeCompare(b.issuedAt),
    AMOUNT_DESC: (a: PosReceipt, b: PosReceipt) => b.totalMinor - a.totalMinor,
    AMOUNT_ASC: (a: PosReceipt, b: PosReceipt) => a.totalMinor - b.totalMinor,
  } as const;
  return [...rows].sort(by[f.sort]);
}

export function activeFilterCount(f: ReceiptFilters): number {
  let n = 0;
  if (f.q.trim() !== "") n += 1;
  if (f.tx !== "ALL") n += 1;
  if (f.payment !== "ALL") n += 1;
  if (f.verification !== "ALL") n += 1;
  if (f.refund !== "ALL") n += 1;
  if (f.date !== "ALL") n += 1;
  return n;
}

export function paginate<T>(rows: T[], page: number, pageSize: number): { pageRows: T[]; page: number; pageCount: number; total: number } {
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safe = Math.min(Math.max(1, page), pageCount);
  return {
    pageRows: rows.slice((safe - 1) * pageSize, safe * pageSize),
    page: safe,
    pageCount,
    total,
  };
}
