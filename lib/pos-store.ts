/* ============================================================
   RECEIPTI — POS local store (Phase 03)
   Persists demo receipts + the transaction counter in
   localStorage so the QR handoff resolves on this device.
   SSR-safe: every function guards for missing window.
   ============================================================ */
import type { PosReceipt } from "@/types/pos";

const RECEIPTS_KEY = "receipti.pos.receipts.v1";
const SEQ_KEY = "receipti.pos.seq.v1";

function canStore(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readAll(): Record<string, PosReceipt> {
  if (!canStore()) return {};
  try {
    return JSON.parse(window.localStorage.getItem(RECEIPTS_KEY) ?? "{}") as Record<
      string,
      PosReceipt
    >;
  } catch {
    return {};
  }
}

export function saveReceipt(receipt: PosReceipt): void {
  if (!canStore()) return;
  try {
    const all = readAll();
    all[receipt.reference] = receipt;
    window.localStorage.setItem(RECEIPTS_KEY, JSON.stringify(all));
  } catch {
    /* Prototype storage is best-effort. */
  }
}

export function getReceiptByReference(reference: string): PosReceipt | null {
  return readAll()[reference] ?? null;
}

/** All POS-created records on this device (Phase 09 dashboard overlay). */
export function listStoredReceipts(): PosReceipt[] {
  return Object.values(readAll());
}

/** Next demo sequence number (starts at 1 per device). */
export function nextSequence(): number {
  if (!canStore()) return 1;
  try {
    const current = Number(window.localStorage.getItem(SEQ_KEY) ?? "0") + 1;
    window.localStorage.setItem(SEQ_KEY, String(current));
    return current;
  } catch {
    return 1;
  }
}

/** Current sequence without incrementing (for display). */
export function peekSequence(): number {
  if (!canStore()) return 1;
  return Number(window.localStorage.getItem(SEQ_KEY) ?? "0") + 1;
}
