/* ============================================================
   RECEIPTI — Integration demo selectors (Phase 10)
   Webhook events, sync logs, and sync stats are derived from
   the merchant's canonical receipts, so ids and totals always
   match the dashboard, receipt, refund, and verification views.
   ============================================================ */
import { receiptTxState } from "@/lib/pos";
import type { PosReceipt } from "@/types/pos";
import type { SyncLogEntry, WebhookEvent } from "@/types/integration";

export const DEMO_API_BASE = "https://api.receipti.demo/v1";
export const DEMO_API_KEY_MASKED = "rct_demo_7H4K••••••••";
/** Fully fake demo secret, safe to reveal — identifies no real account. */
export const DEMO_API_KEY_FULL = "rct_demo_7H4K2N9P4QW8Z";

function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

function slug(reference: string): string {
  return reference.replace(/^RCP_/, "").toLowerCase();
}

/**
 * Demo webhook deliveries for a merchant's receipts, newest first.
 * Includes one ignored duplicate delivery (FAILED) to demonstrate
 * idempotency, and one PENDING refund event mirroring the refund record.
 */
export function webhookEventsFor(receipts: PosReceipt[]): WebhookEvent[] {
  const events: WebhookEvent[] = [];
  const sorted = [...receipts].sort((a, b) => a.issuedAt.localeCompare(b.issuedAt));

  for (const r of sorted) {
    const tx = receiptTxState(r);
    events.push({
      id: `wh-${slug(r.reference)}-created`,
      type: "receipt.created",
      status: "SUCCESS",
      timestamp: addMinutes(r.issuedAt, 2),
      receiptId: r.id,
      reference: r.reference,
      attempts: 1,
      payload: {
        event: "receipt.created",
        receiptId: r.id,
        merchantTransactionId: r.transactionId,
        currency: r.currency,
        total: r.totalMinor / 100,
        status: tx,
      },
    });

    const completed = (r.refunds ?? []).filter((x) => (x.status ?? "COMPLETED") === "COMPLETED");
    if (completed.length > 0) {
      const at = completed[completed.length - 1]!;
      events.push({
        id: `wh-${slug(r.reference)}-payment`,
        type: "payment.updated",
        status: "SUCCESS",
        timestamp: addMinutes(at.createdAt, 1),
        receiptId: r.id,
        reference: r.reference,
        attempts: 1,
        payload: {
          event: "payment.updated",
          receiptId: r.id,
          merchantTransactionId: r.transactionId,
          status: tx,
          refunded: completed.reduce((s, x) => s + x.amountMinor, 0) / 100,
        },
      });
      events.push({
        id: `wh-${slug(r.reference)}-updated`,
        type: "receipt.updated",
        status: "SUCCESS",
        timestamp: addMinutes(at.createdAt, 2),
        receiptId: r.id,
        reference: r.reference,
        attempts: 1,
        payload: {
          event: "receipt.updated",
          receiptId: r.id,
          merchantTransactionId: r.transactionId,
          status: tx,
        },
      });
    }

    for (const refund of r.refunds ?? []) {
      const status = refund.status ?? "COMPLETED";
      events.push({
        id: `wh-${slug(r.reference)}-${refund.id.toLowerCase()}-created`,
        type: "refund.created",
        status: status === "COMPLETED" ? "SUCCESS" : status === "FAILED" ? "FAILED" : "PENDING",
        timestamp: addMinutes(refund.createdAt, 1),
        receiptId: r.id,
        reference: r.reference,
        attempts: 1,
        note:
          status === "COMPLETED"
            ? undefined
            : status === "FAILED"
              ? "Merchant endpoint rejected the payload."
              : "Awaiting merchant approval — no money moved yet.",
        payload: {
          event: "refund.created",
          receiptId: r.id,
          merchantTransactionId: r.transactionId,
          refundId: refund.id,
          amount: refund.amountMinor / 100,
          status,
        },
      });
      if (status === "COMPLETED") {
        events.push({
          id: `wh-${slug(r.reference)}-${refund.id.toLowerCase()}-completed`,
          type: "refund.completed",
          status: "SUCCESS",
          timestamp: addMinutes(refund.processedAt ?? refund.createdAt, 1),
          receiptId: r.id,
          reference: r.reference,
          attempts: 1,
          payload: {
            event: "refund.completed",
            receiptId: r.id,
            merchantTransactionId: r.transactionId,
            refundId: refund.id,
            amount: refund.amountMinor / 100,
          },
        });
      }
    }
  }

  // One ignored duplicate delivery on the oldest receipt: the idempotency story.
  const oldest = sorted[0];
  if (oldest) {
    events.push({
      id: `wh-${slug(oldest.reference)}-duplicate`,
      type: "receipt.updated",
      status: "FAILED",
      timestamp: addMinutes(oldest.issuedAt, 41),
      receiptId: oldest.id,
      reference: oldest.reference,
      attempts: 1,
      note: "Duplicate delivery ignored — idempotency key already processed. No new receipt created.",
      payload: {
        event: "receipt.updated",
        receiptId: oldest.id,
        merchantTransactionId: oldest.transactionId,
        error: "DUPLICATE_TRANSACTION",
      },
    });
  }

  return events.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/** Demo sync log for a merchant's receipts, newest first. */
export function syncLogFor(receipts: PosReceipt[]): SyncLogEntry[] {
  const entries: SyncLogEntry[] = [];
  const sorted = [...receipts].sort((a, b) => a.issuedAt.localeCompare(b.issuedAt));

  for (const r of sorted) {
    entries.push({
      id: `log-${slug(r.reference)}-created`,
      timestamp: addMinutes(r.issuedAt, 2),
      event: "Receipt Created",
      record: r.id,
      status: "SUCCESS",
      source: "POS",
    });
    for (const refund of r.refunds ?? []) {
      const status = refund.status ?? "COMPLETED";
      entries.push({
        id: `log-${slug(r.reference)}-${refund.id.toLowerCase()}`,
        timestamp: addMinutes(refund.createdAt, 1),
        event: "Refund Created",
        record: refund.id,
        status: status === "COMPLETED" ? "SUCCESS" : status === "FAILED" ? "FAILED" : "PENDING",
        source: "POS",
      });
      if (status === "COMPLETED") {
        entries.push({
          id: `log-${slug(r.reference)}-${refund.id.toLowerCase()}-done`,
          timestamp: addMinutes(refund.processedAt ?? refund.createdAt, 2),
          event: "Refund Completed",
          record: refund.id,
          status: "SUCCESS",
          source: "POS",
        });
        entries.push({
          id: `log-${slug(r.reference)}-updated`,
          timestamp: addMinutes(refund.processedAt ?? refund.createdAt, 3),
          event: "Receipt Updated",
          record: r.id,
          status: "SUCCESS",
          source: "POS",
        });
      }
    }
  }

  const latest = sorted[sorted.length - 1];
  if (latest) {
    entries.push({
      id: "log-sync-started",
      timestamp: addMinutes(latest.issuedAt, 60),
      event: "Sync Started",
      record: "—",
      status: "SUCCESS",
      source: "POS",
    });
    entries.push({
      id: "log-sync-completed",
      timestamp: addMinutes(latest.issuedAt, 62),
      event: "Sync Completed",
      record: "—",
      status: "SUCCESS",
      source: "POS",
    });
  }

  return entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export interface SyncStats {
  received: number;
  processed: number;
  pending: number;
  failed: number;
  lastSync: string | null;
}

/** Sync counters derived from the same receipts + log. */
export function syncStatsFor(receipts: PosReceipt[]): SyncStats {
  const log = syncLogFor(receipts);
  return {
    received: receipts.length,
    processed: log.filter((e) => e.status === "SUCCESS" && e.event !== "Sync Started" && e.event !== "Sync Completed").length,
    pending: log.filter((e) => e.status === "PENDING").length,
    failed: log.filter((e) => e.status === "FAILED").length,
    lastSync: log[0]?.timestamp ?? null,
  };
}
