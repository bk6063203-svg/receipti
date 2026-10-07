import { VERIFICATION_EVENTS } from "@/data/merchant-demo";
import type { Currency } from "@/types";
import type { PosReceipt } from "@/types/pos";
import { formatMoney } from "@/lib/format";

export interface MoneyTotal {
  currency: Currency;
  minor: number;
}

/** Sum minor amounts grouped by currency — never converts or mixes. */
export function totalsByCurrency(items: { currency: Currency; minor: number }[]): MoneyTotal[] {
  const map = new Map<Currency, number>();
  for (const i of items) map.set(i.currency, (map.get(i.currency) ?? 0) + i.minor);
  return [...map.entries()]
    .map(([currency, minor]) => ({ currency, minor }))
    .sort((a, b) => a.currency.localeCompare(b.currency));
}

export function formatTotals(totals: MoneyTotal[]): string {
  return totals
    .map((t) => formatMoney({ amountMinor: t.minor, currency: t.currency }))
    .join(" · ");
}

export interface CustomerAlert {
  id: string;
  title: string;
  detail: string;
  href: string;
  merchant: string;
  at: string;
}

/**
 * Arithmetic checks on one receipt. Factual only: reports the numbers
 * that don't add up, never accuses anyone.
 */
export function receiptAlerts(receipt: PosReceipt): CustomerAlert[] {
  const alerts: CustomerAlert[] = [];
  const money = (minor: number) =>
    formatMoney({ amountMinor: minor, currency: receipt.currency });

  for (const line of receipt.lines) {
    const expected = line.quantity * line.unitMinor;
    if (expected !== line.lineMinor) {
      alerts.push({
        id: `${receipt.reference}-line-${line.sku}`,
        title: "Item line doesn't add up",
        detail: `${line.quantity} × ${line.name} at ${money(line.unitMinor)} should be ${money(expected)}, but the line shows ${money(line.lineMinor)}.`,
        href: `/receipt/${receipt.reference}`,
        merchant: receipt.merchant,
        at: receipt.issuedAt,
      });
    }
  }

  const linesSum = receipt.lines.reduce((s, l) => s + l.lineMinor, 0);
  if (linesSum !== receipt.subtotalMinor) {
    alerts.push({
      id: `${receipt.reference}-subtotal`,
      title: "Items don't match the subtotal",
      detail: `Items add up to ${money(linesSum)} but the subtotal is ${money(receipt.subtotalMinor)} — a difference of ${money(Math.abs(receipt.subtotalMinor - linesSum))}.`,
      href: `/receipt/${receipt.reference}`,
      merchant: receipt.merchant,
      at: receipt.issuedAt,
    });
  }

  const expectedTotal = receipt.subtotalMinor - (receipt.discountMinor ?? 0);
  if (expectedTotal !== receipt.totalMinor) {
    alerts.push({
      id: `${receipt.reference}-total`,
      title: "Charged total doesn't match the items",
      detail: `Items add up to ${money(linesSum)} but the receipt total is ${money(receipt.totalMinor)} — a difference of ${money(Math.abs(receipt.totalMinor - linesSum))}. Worth asking the merchant about.`,
      href: `/receipt/${receipt.reference}`,
      merchant: receipt.merchant,
      at: receipt.issuedAt,
    });
  }

  return alerts;
}

/** Verification checks that reported differences, reframed for customers. */
export function mismatchAlerts(receipts: PosReceipt[]): CustomerAlert[] {
  const byRef = new Map(receipts.map((r) => [r.reference, r]));
  const alerts: CustomerAlert[] = [];
  for (const e of VERIFICATION_EVENTS) {
    if (e.result !== "MISMATCH") continue;
    const r = byRef.get(e.reference);
    if (!r) continue;
    alerts.push({
      id: `mismatch-${e.id}`,
      title: "A check found differences on this receipt",
      detail: `A verification check on ${r.merchant} receipt ${r.id} found data that didn't match the trusted record. Review the receipt before relying on it.`,
      href: `/receipt/${r.reference}`,
      merchant: r.merchant,
      at: e.requestedAt,
    });
  }
  return alerts;
}

/* ---------------- persisted fuel discrepancy checks ---------------- */

export interface FuelCheckRecord {
  reference: string | null;
  at: string;
  summary: string;
  mismatch: boolean;
}

const FUEL_CHECKS_KEY = "receipti.fuel.checks.v1";

function canStore(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function saveFuelCheck(check: FuelCheckRecord): void {
  if (!canStore()) return;
  try {
    const prev = listFuelChecks();
    const next = [...prev, check].slice(-20);
    window.localStorage.setItem(FUEL_CHECKS_KEY, JSON.stringify(next));
  } catch {
    /* best-effort */
  }
}

export function listFuelChecks(): FuelCheckRecord[] {
  if (!canStore()) return [];
  try {
    const raw = JSON.parse(window.localStorage.getItem(FUEL_CHECKS_KEY) ?? "[]") as unknown;
    if (!Array.isArray(raw)) return [];
    return raw.filter(
      (c): c is FuelCheckRecord =>
        typeof c === "object" && c !== null && typeof (c as FuelCheckRecord).at === "string"
    );
  } catch {
    return [];
  }
}

export function fuelAlerts(): CustomerAlert[] {
  return listFuelChecks()
    .filter((c) => c.mismatch)
    .map((c, i) => ({
      id: `fuel-${c.at}-${i}`,
      title: "Fuel figures didn't match the record",
      detail: `${c.summary} Open the fuel demo to compare the presented figures against the trusted record.`,
      href: "/demo/fuel",
      merchant: "City Fuel",
      at: c.at,
    }));
}

/** All customer alerts, newest first. */
export function allCustomerAlerts(receipts: PosReceipt[]): CustomerAlert[] {
  const alerts = [
    ...receipts.flatMap(receiptAlerts),
    ...mismatchAlerts(receipts),
    ...fuelAlerts(),
  ];
  return alerts.sort((a, b) => b.at.localeCompare(a.at));
}
