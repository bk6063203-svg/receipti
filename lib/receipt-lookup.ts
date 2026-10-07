import { DEMO_RECEIPTS } from "@/data/pos-demo-receipts";
import { listStoredReceipts } from "@/lib/pos-store";
import type { PosReceipt } from "@/types/pos";

/**
 * Find a receipt by reference (RCP_…), receipt number (RCPT-…), or
 * transaction id — case-insensitive. Stored records win over seeds,
 * so customer-created sales resolve everywhere (receipt page, verify).
 */
export function findReceiptAny(input: string): PosReceipt | null {
  const needle = input.trim().toUpperCase();
  if (needle === "") return null;
  const all = [...listStoredReceipts(), ...DEMO_RECEIPTS];
  return (
    all.find((r) => {
      return (
        r.reference.toUpperCase() === needle ||
        r.id.toUpperCase() === needle ||
        r.transactionId.toUpperCase() === needle
      );
    }) ?? null
  );
}
