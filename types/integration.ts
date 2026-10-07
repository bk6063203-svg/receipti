/* ============================================================
   RECEIPTI — Merchant integration demo types (Phase 10)
   Frontend demo only. Webhook events and sync logs are
   derived from the canonical receipts — never a second ledger.
   ============================================================ */

export type WebhookEventType =
  | "receipt.created"
  | "receipt.updated"
  | "payment.updated"
  | "refund.created"
  | "refund.completed";

export type DeliveryStatus = "SUCCESS" | "PENDING" | "FAILED";

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  status: DeliveryStatus;
  /** ISO timestamp of the latest attempt. */
  timestamp: string;
  receiptId: string;
  reference: string;
  attempts: number;
  /** Factual delivery note. Absent on clean first-try deliveries. */
  note?: string;
  payload: Record<string, unknown>;
}

export type SyncLogStatus = "SUCCESS" | "PENDING" | "FAILED";

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  event: string;
  /** Receipt id, refund id, or "—" for sync bookends. */
  record: string;
  status: SyncLogStatus;
  source: "POS";
}
