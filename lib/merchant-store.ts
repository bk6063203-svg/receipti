/* ============================================================
   RECEIPTI — Merchant dashboard prototype store (Phase 09)
   Remembers which demo merchant is active on this device.
   No authentication — the switcher is a demo affordance.
   ============================================================ */
import { MERCHANT_IDS } from "@/data/merchant-demo";

const ACTIVE_KEY = "receipti.merchant.active.v1";
export const DEFAULT_MERCHANT_ID = "urban-threads";

function canStore(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getActiveMerchantId(): string {
  if (!canStore()) return DEFAULT_MERCHANT_ID;
  try {
    const id = window.localStorage.getItem(ACTIVE_KEY);
    return id && (MERCHANT_IDS as string[]).includes(id) ? id : DEFAULT_MERCHANT_ID;
  } catch {
    return DEFAULT_MERCHANT_ID;
  }
}

export function setActiveMerchantId(id: string): void {
  if (!canStore()) return;
  try {
    window.localStorage.setItem(ACTIVE_KEY, id);
  } catch {
    /* best-effort */
  }
}
