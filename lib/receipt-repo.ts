import { isRemoteSyncConfigured } from "./live-transaction";
import type {
  AuditEvent,
  AuditType,
  ReceiptRecord,
  VerifyEvent,
  VerifyResult,
  WalletEntry,
} from "./live-receipt-record";
import type { LiveClaimMethod } from "./live-transaction";

export type RepoMode = "supabase" | "local";
/** Dispatched after every local demo-store mutation (same-tab refresh). */
export const DB_EVENT = "receipti:db";

export type RefundOutcome = { record: ReceiptRecord } | { error: string };

export interface ReceiptRepository {
  readonly mode: RepoMode;
  /** True when the backend is reachable (supabase pings, local always true). */
  ping(): Promise<boolean>;
  saveReceipt(r: ReceiptRecord): Promise<void>;
  getReceipt(receiptId: string): Promise<ReceiptRecord | null>;
  getReceiptByToken(token: string): Promise<ReceiptRecord | null>;
  /** Merchant-scoped: implementations must never return other merchants' rows. */
  listMerchantReceipts(merchantId: string): Promise<ReceiptRecord[]>;
  /** First claim wins — returns null when already claimed or missing. */
  setClaim(
    receiptId: string,
    customerId: string,
    method: LiveClaimMethod
  ): Promise<ReceiptRecord | null>;
  /** Separate auditable event — never overwrites the original record core. */
  applyRefund(receiptId: string, amount: number | "all"): Promise<RefundOutcome>;
  applyVoid(receiptId: string): Promise<RefundOutcome>;
  /** Visible (non-hidden) wallet entries, newest first. */
  listWallet(customerId: string): Promise<WalletEntry[]>;
  /** Hides the wallet entry only — the receipt record is untouched. */
  hideWalletEntry(customerId: string, receiptId: string): Promise<void>;
  appendAudit(e: {
    receiptId: string;
    type: AuditType;
    detail: string;
    amountMinor: number | null;
    actor: AuditEvent["actor"];
  }): Promise<void>;
  listAudit(receiptId: string): Promise<AuditEvent[]>;
  logVerify(e: { receiptId: string; result: VerifyResult; source: VerifyEvent["source"] }): Promise<void>;
  listVerifyLog(limit?: number): Promise<VerifyEvent[]>;
}

let cached: Promise<ReceiptRepository> | null = null;

/**
 * Supabase when configured AND reachable, otherwise the labeled local
 * demo store. Never throws — worst case is the local fallback.
 */
export function getRepository(): Promise<ReceiptRepository> {
  cached ??= (async () => {
    if (isRemoteSyncConfigured()) {
      try {
        const mod = await import("./receipt-repo-supabase");
        const repo = mod.createSupabaseReceiptRepo();
        if (await repo.ping().catch(() => false)) return repo;
        console.warn("[live-db] Supabase unreachable — using local demo store");
      } catch (err) {
        console.warn("[live-db] Supabase init failed — using local demo store", err);
      }
    }
    const mod = await import("./receipt-repo-local");
    return mod.createLocalReceiptRepo();
  })();
  return cached;
}

/** Synchronous env-based hint for first paint; the badge resolves the real mode. */
export function getConfiguredRepoMode(): RepoMode {
  return isRemoteSyncConfigured() ? "supabase" : "local";
}
