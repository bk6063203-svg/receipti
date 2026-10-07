/* ============================================================
   RECEIPTI — Admin overview selectors (Phase 12)
   System-wide demo figures derived from the same canonical
   receipts, merchants, and verification events as every other
   surface. No second ledger, no hardcoded copies.
   ============================================================ */
import { DEMO_RECEIPTS } from "@/data/pos-demo-receipts";
import { MERCHANTS, VERIFICATION_EVENTS, merchantIdForName } from "@/data/merchant-demo";
import { receiptTxState } from "@/lib/pos";
import type { Currency } from "@/types";
import type { PosReceipt } from "@/types/pos";

export interface AdminReceiptRow {
  receipt: PosReceipt;
  source: "Demo data" | "POS · this device";
}

/** Every known receipt: seeds overlaid with this device's POS records. */
export function allReceipts(stored: PosReceipt[]): AdminReceiptRow[] {
  const seedRefs = new Set(DEMO_RECEIPTS.map((r) => r.reference));
  const byRef = new Map<string, AdminReceiptRow>();
  for (const r of DEMO_RECEIPTS) byRef.set(r.reference, { receipt: r, source: "Demo data" });
  for (const r of stored) {
    byRef.set(r.reference, {
      receipt: r,
      source: seedRefs.has(r.reference) ? "Demo data" : "POS · this device",
    });
  }
  return [...byRef.values()].sort((a, b) => b.receipt.issuedAt.localeCompare(a.receipt.issuedAt));
}

export interface MerchantStat {
  id: string;
  name: string;
  branch: string;
  trade: string;
  posName: string;
  status: "CONNECTED";
  receipts: number;
  lastSync: string | null;
}

export function merchantStats(rows: AdminReceiptRow[]): MerchantStat[] {
  return MERCHANTS.map((m) => {
    const mine = rows.filter((r) => merchantIdForName(r.receipt.merchant) === m.id);
    return {
      id: m.id,
      name: m.name,
      branch: m.branch,
      trade: m.trade,
      posName: m.posName,
      status: "CONNECTED",
      receipts: mine.length,
      lastSync: mine[0]?.receipt.issuedAt ?? null,
    };
  });
}

export interface SystemTotals {
  merchants: number;
  receipts: number;
  transactions: number;
  refunds: number;
  verificationEvents: number;
  discrepancies: number;
}

export function systemTotals(rows: AdminReceiptRow[]): SystemTotals {
  const refunds = rows.reduce((n, r) => n + (r.receipt.refunds ?? []).length, 0);
  const knownRefs = new Set(rows.map((r) => r.receipt.reference));
  const events = VERIFICATION_EVENTS.filter(
    (e) => knownRefs.has(e.reference) || e.receiptId === null
  );
  return {
    merchants: MERCHANTS.length,
    receipts: rows.length,
    transactions: rows.length,
    refunds,
    verificationEvents: events.length,
    discrepancies: events.filter((e) => e.result === "MISMATCH").length,
  };
}

export type ActivityKind = "receipt" | "refund" | "verification" | "integration" | "discrepancy";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  at: string;
  href: string;
}

/** Global demo activity, newest first, each item deep-linking home. */
export function activityFeed(rows: AdminReceiptRow[]): ActivityItem[] {
  const items: ActivityItem[] = [];
  const knownRefs = new Set(rows.map((r) => r.receipt.reference));

  for (const { receipt: r } of rows) {
    items.push({
      id: `act-${r.reference}-created`,
      kind: "receipt",
      title: "Receipt created",
      detail: `${r.id} · ${r.merchant}`,
      at: r.issuedAt,
      href: `/receipt/${r.reference}`,
    });
    for (const refund of r.refunds ?? []) {
      const status = refund.status ?? "COMPLETED";
      items.push({
        id: `act-${r.reference}-${refund.id}`,
        kind: "refund",
        title: status === "COMPLETED" ? "Refund completed" : `Refund ${status.toLowerCase()}`,
        detail: `${refund.id} · ${r.id}`,
        at: refund.createdAt,
        href: `/receipt/${r.reference}#refunds`,
      });
    }
  }

  for (const e of VERIFICATION_EVENTS) {
    if (!knownRefs.has(e.reference) && e.receiptId !== null) continue;
    if (e.result === "MISMATCH") {
      items.push({
        id: `act-${e.id}`,
        kind: "discrepancy",
        title: "Discrepancy detected",
        detail: `${e.receiptId ?? e.reference} · presented data differed`,
        at: e.requestedAt,
        href: `/receipt/${e.reference}`,
      });
    } else {
      items.push({
        id: `act-${e.id}`,
        kind: "verification",
        title: e.result === "VERIFIED" ? "Verification completed" : `Verification ${e.result.toLowerCase().replace("_", " ")}`,
        detail: e.receiptId ?? e.reference,
        at: e.requestedAt,
        href: `/verify/${e.reference}`,
      });
    }
  }

  for (const m of MERCHANTS) {
    const mine = rows.filter((r) => merchantIdForName(r.receipt.merchant) === m.id);
    if (mine[0]) {
      items.push({
        id: `act-sync-${m.id}`,
        kind: "integration",
        title: "Integration synchronized",
        detail: m.posName,
        at: mine[0].receipt.issuedAt,
        href: "/merchant/integration/logs",
      });
    }
  }

  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 14);
}

export interface MoneyTotal {
  currency: Currency;
  minor: number;
}

function groupSum(rows: AdminReceiptRow[], pick: (r: PosReceipt) => number): MoneyTotal[] {
  const map = new Map<Currency, number>();
  for (const r of rows) {
    map.set(r.receipt.currency, (map.get(r.receipt.currency) ?? 0) + pick(r.receipt));
  }
  return [...map.entries()]
    .map(([currency, minor]) => ({ currency, minor }))
    .sort((a, b) => a.currency.localeCompare(b.currency));
}

export interface MerchantMoney {
  id: string;
  name: string;
  trade: string;
  posName: string;
  receipts: number;
  revenue: MoneyTotal[];
  tax: MoneyTotal[];
}

/** Per-merchant revenue (receipt totals) and reported tax, grouped by currency. */
export function merchantMoney(rows: AdminReceiptRow[]): MerchantMoney[] {
  return MERCHANTS.map((m) => {
    const mine = rows.filter((r) => merchantIdForName(r.receipt.merchant) === m.id);
    return {
      id: m.id,
      name: m.name,
      trade: m.trade,
      posName: m.posName,
      receipts: mine.length,
      revenue: groupSum(mine, (r) => r.totalMinor),
      tax: groupSum(mine, (r) => r.taxMinor ?? 0),
    };
  });
}

/** System-wide reported tax totals (demo figures from receipt records). */
export function taxTotals(rows: AdminReceiptRow[]): MoneyTotal[] {
  return groupSum(rows, (r) => r.taxMinor ?? 0);
}
