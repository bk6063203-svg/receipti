/* ============================================================
   RECEIPTI — Fuel transaction check (Phase 11)
   Deterministic comparison between customer-presented fuel
   figures and the authoritative receipt record. Frontend demo
   only: differences are reported factually, never judged.
   ============================================================ */
import type { Currency } from "@/types";
import type { PosReceipt } from "@/types/pos";
import { formatMoney } from "@/lib/format";
import { inclusiveTaxMinor } from "@/lib/pos";

/** Fixed demo identifiers — the same transaction every run. */
export const FUEL_DEMO = {
  merchant: "Receipti Fuel Station",
  branch: "Main Boulevard",
  receiptId: "RCPT-FUEL-48291",
  transactionId: "FUEL-TXN-48291",
  reference: "RCP_FU3L829",
  unknownReference: "RCP_FU3L000",
  fuelType: "Petrol",
  sku: "RF-PET-91",
  quantityL: 35.2,
  priceMinorPerL: 28500,
  currency: "PKR" as Currency,
  paymentMethod: "CARD" as const,
};

/** The authoritative demo record, created locally like a POS receipt. */
export function buildFuelReceipt(now: Date = new Date()): PosReceipt {
  const lineMinor = Math.round(FUEL_DEMO.quantityL * FUEL_DEMO.priceMinorPerL);
  return {
    id: FUEL_DEMO.receiptId,
    transactionId: FUEL_DEMO.transactionId,
    reference: FUEL_DEMO.reference,
    merchant: FUEL_DEMO.merchant,
    branch: FUEL_DEMO.branch,
    lines: [
      {
        name: FUEL_DEMO.fuelType,
        sku: FUEL_DEMO.sku,
        quantity: FUEL_DEMO.quantityL,
        unitMinor: FUEL_DEMO.priceMinorPerL,
        lineMinor,
        category: "Fuel",
      },
    ],
    subtotalMinor: lineMinor,
    discountMinor: 0,
    taxMinor: inclusiveTaxMinor(lineMinor),
    totalMinor: lineMinor,
    currency: FUEL_DEMO.currency,
    paymentMethod: FUEL_DEMO.paymentMethod,
    paymentStatus: "PAID",
    receiptState: "READY",
    verification: "VERIFIED",
    issuedAt: now.toISOString(),
  };
}

/* ---------------- comparison engine ---------------- */

export interface PresentedFuelInfo {
  fuelType: string;
  quantityL: string;
  pricePerL: string;
  total: string;
  transactionId: string;
}

export interface FuelRecord {
  fuelType: string;
  quantityL: number;
  priceMinorPerL: number;
  totalMinor: number;
  transactionId: string;
  currency: Currency;
}

export type FieldStatus = "MATCH" | "MISMATCH";

export interface FieldComparison {
  field: string;
  label: string;
  presented: string;
  recorded: string;
  /** Human difference, or null when not quantifiable. */
  difference: string | null;
  status: FieldStatus;
}

export interface FuelCheckResult {
  fields: FieldComparison[];
  matched: number;
  total: number;
  allMatch: boolean;
  /** Presented qty × price vs presented total (self-consistency). */
  arithmeticOk: boolean | null;
  arithmeticNote: string | null;
}

/** Strip grouping/whitespace; parse a decimal. NaN when unreadable. */
function parseDecimal(raw: string): number {
  const cleaned = raw.replace(/[\s,]/g, "").replace(/[a-zA-Z$€£₨]+/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return NaN;
  return Number(cleaned);
}

function money(currency: Currency, minor: number): string {
  return formatMoney({ amountMinor: minor, currency });
}

function litres(n: number): string {
  return `${n.toFixed(2)} L`;
}

export function recordFromReceipt(receipt: PosReceipt): FuelRecord {
  const line = receipt.lines[0];
  return {
    fuelType: line?.name ?? "",
    quantityL: line?.quantity ?? 0,
    priceMinorPerL: line?.unitMinor ?? 0,
    totalMinor: receipt.totalMinor,
    transactionId: receipt.transactionId,
    currency: receipt.currency,
  };
}

/**
 * Compare presented figures against the record. Deterministic:
 * same inputs always produce the same verdict — no randomness, no AI.
 */
export function compareFuelTransaction(
  presented: PresentedFuelInfo,
  record: FuelRecord
): FuelCheckResult {
  const fields: FieldComparison[] = [];

  // Fuel type: case-insensitive, surrounding whitespace ignored.
  const fuelOk = presented.fuelType.trim().toLowerCase() === record.fuelType.trim().toLowerCase();
  fields.push({
    field: "fuelType",
    label: "Fuel type",
    presented: presented.fuelType.trim() === "" ? "—" : presented.fuelType.trim(),
    recorded: record.fuelType,
    difference: null,
    status: fuelOk ? "MATCH" : "MISMATCH",
  });

  // Quantity: normalized to 2dp litres before comparison.
  const qPresented = parseDecimal(presented.quantityL);
  const qOk = !Number.isNaN(qPresented) && Math.round(qPresented * 100) === Math.round(record.quantityL * 100);
  fields.push({
    field: "quantityL",
    label: "Quantity",
    presented: Number.isNaN(qPresented) ? presented.quantityL.trim() || "—" : litres(qPresented),
    recorded: litres(record.quantityL),
    difference:
      qOk || Number.isNaN(qPresented) ? null : `${Math.abs(qPresented - record.quantityL).toFixed(2)} L`,
    status: qOk ? "MATCH" : "MISMATCH",
  });

  // Price per litre: normalized to minor units before comparison.
  const pPresented = parseDecimal(presented.pricePerL);
  const pMinor = Number.isNaN(pPresented) ? NaN : Math.round(pPresented * 100);
  const pOk = !Number.isNaN(pMinor) && pMinor === record.priceMinorPerL;
  fields.push({
    field: "pricePerL",
    label: "Price / litre",
    presented: Number.isNaN(pMinor) ? presented.pricePerL.trim() || "—" : money(record.currency, pMinor),
    recorded: money(record.currency, record.priceMinorPerL),
    difference: pOk || Number.isNaN(pMinor) ? null : money(record.currency, Math.abs(pMinor - record.priceMinorPerL)),
    status: pOk ? "MATCH" : "MISMATCH",
  });

  // Total: normalized to minor units ("10,032.00" equals "10032").
  const tPresented = parseDecimal(presented.total);
  const tMinor = Number.isNaN(tPresented) ? NaN : Math.round(tPresented * 100);
  const tOk = !Number.isNaN(tMinor) && tMinor === record.totalMinor;
  fields.push({
    field: "total",
    label: "Total",
    presented: Number.isNaN(tMinor) ? presented.total.trim() || "—" : money(record.currency, tMinor),
    recorded: money(record.currency, record.totalMinor),
    difference: tOk || Number.isNaN(tMinor) ? null : money(record.currency, Math.abs(tMinor - record.totalMinor)),
    status: tOk ? "MATCH" : "MISMATCH",
  });

  // Transaction ID: exact comparison.
  const txnOk = presented.transactionId.trim() === record.transactionId;
  fields.push({
    field: "transactionId",
    label: "Transaction ID",
    presented: presented.transactionId.trim() === "" ? "—" : presented.transactionId.trim(),
    recorded: record.transactionId,
    difference: null,
    status: txnOk ? "MATCH" : "MISMATCH",
  });

  // Presented arithmetic: does qty × price reproduce the presented total?
  let arithmeticOk: boolean | null = null;
  let arithmeticNote: string | null = null;
  if (!Number.isNaN(qPresented) && !Number.isNaN(pMinor) && !Number.isNaN(tMinor)) {
    const computed = Math.round(qPresented * pMinor);
    arithmeticOk = computed === tMinor;
    arithmeticNote = arithmeticOk
      ? "Presented figures are internally consistent."
      : `Presented quantity × price = ${money(record.currency, computed)}, not ${money(record.currency, tMinor)}.`;
  }

  const matched = fields.filter((f) => f.status === "MATCH").length;
  return { fields, matched, total: fields.length, allMatch: matched === fields.length, arithmeticOk, arithmeticNote };
}

/** Scenario presets for the presented side (record stays fixed). */
export function scenarioPresented(
  scenario: "matching" | "amount" | "quantity" | "fuel-type",
  record: FuelRecord
): PresentedFuelInfo {
  const base: PresentedFuelInfo = {
    fuelType: record.fuelType,
    quantityL: record.quantityL.toFixed(2),
    pricePerL: (record.priceMinorPerL / 100).toFixed(2),
    total: (record.totalMinor / 100).toFixed(2),
    transactionId: record.transactionId,
  };
  if (scenario === "amount") return { ...base, total: ((record.totalMinor + 50000) / 100).toFixed(2) };
  if (scenario === "quantity") return { ...base, quantityL: (record.quantityL + 1).toFixed(2) };
  if (scenario === "fuel-type") return { ...base, fuelType: "Diesel" };
  return base;
}
