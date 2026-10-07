import type {
  AuditEvent,
  ReceiptRecord,
  VerifyEvent,
  WalletEntry,
} from "./live-receipt-record";
import { DB_EVENT, type ReceiptRepository, type RefundOutcome } from "./receipt-repo";
import type { LiveClaimMethod } from "./live-transaction";

/**
 * LOCAL DEMO STORE — explicitly not a production database.
 * Persists finalized receipts in this browser only (survives refresh), so the
 * wallet / verify / history flows are fully demonstrable without a backend.
 * Connect Supabase (see supabase/migrations + README) for the shared database.
 */

const RECEIPTS_KEY = "receipti.db.receipts.v1";
const WALLET_KEY = "receipti.db.wallet.v1";
const AUDIT_KEY = "receipti.db.audit.v1";
const VERIFY_KEY = "receipti.db.verifylog.v1";

function canStore(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function read<T>(key: string, fallback: T): T {
  if (!canStore()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (!canStore()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* demo store is best-effort */
  }
}

function emit(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(DB_EVENT));
}

function uid(prefix: string): string {
  const rand =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID().slice(0, 8)
      : Math.floor(Math.random() * 0xffffffff).toString(16);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}

type ReceiptMap = Record<string, ReceiptRecord>;

function loadReceipts(): ReceiptMap {
  const v = read<ReceiptMap>(RECEIPTS_KEY, {});
  return v && typeof v === "object" ? v : {};
}

export function createLocalReceiptRepo(): ReceiptRepository {
  return {
    mode: "local",
    ping: async () => true,

    saveReceipt: async (r) => {
      const map = loadReceipts();
      if (map[r.receiptId]) return; // insert-only: history is never rewritten
      map[r.receiptId] = r;
      write(RECEIPTS_KEY, map);
      emit();
    },

    getReceipt: async (receiptId) => loadReceipts()[receiptId] ?? null,

    getReceiptByToken: async (token) =>
      Object.values(loadReceipts()).find((r) => r.claimToken === token) ?? null,

    listMerchantReceipts: async (merchantId) =>
      Object.values(loadReceipts())
        .filter((r) => r.merchantId === merchantId)
        .sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : -1)),

    setClaim: async (receiptId: string, customerId: string, method: LiveClaimMethod) => {
      const map = loadReceipts();
      const r = map[receiptId];
      if (!r || r.claimedAt) return null;
      const updated: ReceiptRecord = {
        ...r,
        customerId,
        claimMethod: method,
        claimedAt: new Date().toISOString(),
        rev: r.rev + 1,
      };
      map[receiptId] = updated;
      write(RECEIPTS_KEY, map);
      const wallet = read<WalletEntry[]>(WALLET_KEY, []);
      const existing = wallet.find((w) => w.customerId === customerId && w.receiptId === receiptId);
      if (existing) existing.hidden = false;
      else wallet.push({ customerId, receiptId, addedAt: new Date().toISOString(), hidden: false });
      write(WALLET_KEY, wallet);
      emit();
      return updated;
    },

    applyRefund: async (receiptId: string, amount: number | "all"): Promise<RefundOutcome> => {
      const map = loadReceipts();
      const r = map[receiptId];
      if (!r) return { error: "Receipt not found." };
      if (r.receiptStatus === "VOIDED") return { error: "Voided receipts cannot be refunded." };
      if (r.receiptStatus === "REFUNDED") return { error: "Receipt is already fully refunded." };
      const remaining = r.totalMinor - r.refundedMinor;
      if (amount === "all") {
        if (remaining <= 0) return { error: "Nothing left to refund." };
      } else {
        const requested = Math.round(amount);
        if (!Number.isFinite(requested) || requested <= 0)
          return { error: "Enter an amount greater than zero." };
        if (requested > remaining)
          return { error: `Only Rs ${(remaining / 100).toLocaleString("en-PK")} remains refundable.` };
      }
      const amt = amount === "all" ? remaining : Math.round(amount);
      const refundedMinor = r.refundedMinor + amt;
      const full = refundedMinor >= r.totalMinor;
      const updated: ReceiptRecord = {
        ...r,
        refundedMinor,
        receiptStatus: full ? "REFUNDED" : "PARTIAL",
        paymentStatus: full ? "REFUNDED" : "PARTIALLY_REFUNDED",
        rev: r.rev + 1,
      };
      map[receiptId] = updated;
      write(RECEIPTS_KEY, map);
      emit();
      return { record: updated };
    },

    applyVoid: async (receiptId: string): Promise<RefundOutcome> => {
      const map = loadReceipts();
      const r = map[receiptId];
      if (!r) return { error: "Receipt not found." };
      if (r.receiptStatus !== "VALID") return { error: "Only valid receipts can be voided." };
      if (r.refundedMinor > 0) return { error: "Refund the remaining amount instead of voiding." };
      const updated: ReceiptRecord = {
        ...r,
        receiptStatus: "VOIDED",
        paymentStatus: "VOIDED",
        rev: r.rev + 1,
      };
      map[receiptId] = updated;
      write(RECEIPTS_KEY, map);
      emit();
      return { record: updated };
    },

    listWallet: async (customerId: string) =>
      read<WalletEntry[]>(WALLET_KEY, [])
        .filter((w) => w.customerId === customerId && !w.hidden)
        .sort((a, b) => (a.addedAt < b.addedAt ? 1 : -1)),

    hideWalletEntry: async (customerId: string, receiptId: string) => {
      const wallet = read<WalletEntry[]>(WALLET_KEY, []);
      const entry = wallet.find((w) => w.customerId === customerId && w.receiptId === receiptId);
      if (entry) {
        entry.hidden = true;
        write(WALLET_KEY, wallet);
        emit();
      }
    },

    appendAudit: async (e) => {
      const log = read<AuditEvent[]>(AUDIT_KEY, []);
      log.push({ ...e, id: uid("AUD"), at: new Date().toISOString() });
      write(AUDIT_KEY, log.slice(-200));
      emit();
    },

    listAudit: async (receiptId: string) =>
      read<AuditEvent[]>(AUDIT_KEY, [])
        .filter((a) => a.receiptId === receiptId)
        .sort((a, b) => (a.at < b.at ? -1 : 1)),

    logVerify: async (e) => {
      const log = read<VerifyEvent[]>(VERIFY_KEY, []);
      log.push({ ...e, id: uid("VRF"), at: new Date().toISOString() });
      write(VERIFY_KEY, log.slice(-200));
      emit();
    },

    listVerifyLog: async (limit = 50) =>
      read<VerifyEvent[]>(VERIFY_KEY, [])
        .sort((a, b) => (a.at < b.at ? 1 : -1))
        .slice(0, limit),
  };
}
