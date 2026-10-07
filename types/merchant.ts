/* ============================================================
   RECEIPTI — Merchant dashboard demo types (Phase 09)
   Frontend demo only. Transactions reuse the canonical
   PosReceipt records — the dashboard never forks receipt,
   refund, or verification state.
   ============================================================ */

/** A demo business connected to Receipti (mock data, no auth). */
export interface Merchant {
  id: string;
  name: string;
  branch: string;
  trade: string;
  /** Merchant-side system name shown as the data source. */
  posName: string;
}

/** Whether the customer received / opened the digital receipt (demo). */
export type DeliveryStatus = "DELIVERED" | "VIEWED" | "PENDING" | "UNAVAILABLE";

export type DeliveryMethod = "QR" | "NFC" | "Wallet" | "Web";

export interface DeliveryInfo {
  status: DeliveryStatus;
  /** Access method; absent when nothing was delivered. */
  method?: DeliveryMethod;
}

/**
 * Outcome of a single verification request (Phase 05 vocabulary).
 * A request outcome is history — it never rewrites the receipt record.
 */
export type VerificationResult = "VERIFIED" | "MISMATCH" | "NOT_FOUND" | "UNAVAILABLE";

export interface VerificationEvent {
  id: string;
  merchantId: string;
  /** Reference that was checked (may be unknown for NOT_FOUND). */
  reference: string;
  /** Resolved receipt id, or null when nothing resolved. */
  receiptId: string | null;
  result: VerificationResult;
  requestedAt: string;
  /** Factual context, e.g. what differed. Never fraud language. */
  note?: string;
}
