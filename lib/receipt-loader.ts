/* ============================================================
   RECEIPTI — Receipt loader (Phase 04)
   Single boundary the receipt page reads through. Today it
   merges POS-created records (localStorage) with demo seeds;
   tomorrow it calls the API — the page stays unchanged.
   ============================================================ */
import { SYNC_DEMO_REF } from "@/data/pos-demo-receipts";
import { findReceiptAny } from "@/lib/receipt-lookup";
import { withResolvedMedia } from "@/lib/pos-media";
import type { PosReceipt } from "@/types/pos";

export type ReceiptLoadResult =
  | { kind: "found"; receipt: PosReceipt }
  | { kind: "syncing" }
  | { kind: "not-found" };

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function loadReceipt(reference: string): Promise<ReceiptLoadResult> {
  const ref = reference.trim();
  // Simulated fetch latency so loading states are visible and honest.
  await delay(550);

  if (ref === SYNC_DEMO_REF) return { kind: "syncing" };

  const found = findReceiptAny(ref);
  if (found) return { kind: "found", receipt: withResolvedMedia(found) };

  return { kind: "not-found" };
}
