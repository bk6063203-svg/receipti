/* ============================================================
   RECEIPTI — Wallet prototype store (Phase 04)
   "Save to Receipti" persists receipt references locally.
   Future wallet reads the same reference list from an account.
   ============================================================ */

const SAVED_KEY = "receipti.wallet.saved.v1";

function canStore(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getSavedRefs(): string[] {
  if (!canStore()) return [];
  try {
    const raw = JSON.parse(window.localStorage.getItem(SAVED_KEY) ?? "[]") as unknown;
    return Array.isArray(raw) ? raw.filter((r): r is string => typeof r === "string") : [];
  } catch {
    return [];
  }
}

export function isReceiptSaved(reference: string): boolean {
  return getSavedRefs().includes(reference);
}

export function setReceiptSaved(reference: string, saved: boolean): string[] {
  const next = saved
    ? Array.from(new Set([...getSavedRefs(), reference]))
    : getSavedRefs().filter((r) => r !== reference);
  if (canStore()) {
    try {
      window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    } catch {
      /* best-effort */
    }
  }
  return next;
}
