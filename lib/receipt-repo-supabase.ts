import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  AuditEvent,
  ReceiptLine,
  ReceiptRecord,
  VerifyEvent,
  WalletEntry,
} from "./live-receipt-record";
import type { ReceiptRepository, RefundOutcome } from "./receipt-repo";
import type { LiveClaimMethod } from "./live-transaction";

/**
 * Supabase-backed receipt repository (tables in supabase/migrations/).
 * Demo-grade read-modify-write: production hardening (atomic RPCs, RLS by
 * authenticated merchant/customer, server-computed integrity) is called out
 * in the migration comments and README.
 */

let client: SupabaseClient | null = null;

function db(): SupabaseClient {
  client ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return client;
}

type Row = Record<string, any>;

function toRow(r: ReceiptRecord): Row {
  return {
    receipt_id: r.receiptId,
    merchant_id: r.merchantId,
    merchant_name: r.merchantName,
    transaction_id: r.transactionId,
    created_at: r.createdAt,
    issued_at: r.issuedAt,
    lines: r.lines,
    currency: r.currency,
    subtotal_minor: r.subtotalMinor,
    discount_minor: r.discountMinor,
    discount_label: r.discountLabel,
    tax_minor: r.taxMinor,
    tax_pct: r.taxPct,
    total_minor: r.totalMinor,
    refunded_minor: r.refundedMinor,
    method: r.method,
    payment_status: r.paymentStatus,
    receipt_status: r.receiptStatus,
    customer_id: r.customerId,
    claim_token: r.claimToken,
    claim_method: r.claimMethod,
    claimed_at: r.claimedAt,
    integrity: r.integrity,
    rev: r.rev,
  };
}

function fromRow(row: Row): ReceiptRecord {
  return {
    receiptId: row.receipt_id,
    merchantId: row.merchant_id,
    merchantName: row.merchant_name,
    transactionId: row.transaction_id,
    createdAt: row.created_at,
    issuedAt: row.issued_at,
    lines: (row.lines ?? []) as ReceiptLine[],
    currency: row.currency,
    subtotalMinor: row.subtotal_minor,
    discountMinor: row.discount_minor,
    discountLabel: row.discount_label,
    taxMinor: row.tax_minor,
    taxPct: row.tax_pct,
    totalMinor: row.total_minor,
    refundedMinor: row.refunded_minor,
    method: row.method,
    paymentStatus: row.payment_status,
    receiptStatus: row.receipt_status,
    customerId: row.customer_id,
    claimToken: row.claim_token,
    claimMethod: row.claim_method,
    claimedAt: row.claimed_at,
    integrity: row.integrity,
    rev: row.rev,
  };
}

async function insertAudit(e: {
  receiptId: string;
  type: string;
  detail: string;
  amountMinor: number | null;
  actor: string;
}): Promise<void> {
  const { error } = await db().from("live_audit").insert({
    receipt_id: e.receiptId,
    type: e.type,
    detail: e.detail,
    amount_minor: e.amountMinor,
    actor: e.actor,
  });
  if (error) throw error;
}

export function createSupabaseReceiptRepo(): ReceiptRepository {
  return {
    mode: "supabase",

    ping: async () => {
      const { error } = await db()
        .from("live_receipts")
        .select("receipt_id", { head: true, count: "exact" });
      return !error;
    },

    saveReceipt: async (r) => {
      const { error } = await db().from("live_receipts").upsert(toRow(r), { onConflict: "receipt_id", ignoreDuplicates: true });
      if (error) throw error;
    },

    getReceipt: async (receiptId) => {
      const { data, error } = await db()
        .from("live_receipts")
        .select("*")
        .eq("receipt_id", receiptId)
        .maybeSingle();
      if (error) throw error;
      return data ? fromRow(data) : null;
    },

    getReceiptByToken: async (token) => {
      const { data, error } = await db()
        .from("live_receipts")
        .select("*")
        .eq("claim_token", token)
        .maybeSingle();
      if (error) throw error;
      return data ? fromRow(data) : null;
    },

    listMerchantReceipts: async (merchantId) => {
      const { data, error } = await db()
        .from("live_receipts")
        .select("*")
        .eq("merchant_id", merchantId)
        .order("issued_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(fromRow);
    },

    setClaim: async (receiptId: string, customerId: string, method: LiveClaimMethod) => {
      const { data, error } = await db()
        .from("live_receipts")
        .update({
          customer_id: customerId,
          claim_method: method,
          claimed_at: new Date().toISOString(),
        })
        .eq("receipt_id", receiptId)
        .is("claimed_at", null)
        .select("*");
      if (error) throw error;
      if (!data || data.length === 0) return null;
      const { error: walletError } = await db().from("live_wallet").upsert(
        { customer_id: customerId, receipt_id: receiptId, hidden: false },
        { onConflict: "customer_id,receipt_id" }
      );
      if (walletError) throw walletError;
      return fromRow(data[0]);
    },

    applyRefund: async (receiptId: string, amount: number | "all"): Promise<RefundOutcome> => {
      const { data, error } = await db()
        .from("live_receipts")
        .select("*")
        .eq("receipt_id", receiptId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return { error: "Receipt not found." };
      const r = fromRow(data);
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
      const patch = {
        refunded_minor: refundedMinor,
        receipt_status: full ? "REFUNDED" : "PARTIAL",
        payment_status: full ? "REFUNDED" : "PARTIALLY_REFUNDED",
        rev: r.rev + 1,
      };
      const { error: updateError } = await db()
        .from("live_receipts")
        .update(patch)
        .eq("receipt_id", receiptId);
      if (updateError) throw updateError;
      return { record: { ...r, refundedMinor, receiptStatus: patch.receipt_status as ReceiptRecord["receiptStatus"], paymentStatus: patch.payment_status as ReceiptRecord["paymentStatus"], rev: r.rev + 1 } };
    },

    applyVoid: async (receiptId: string): Promise<RefundOutcome> => {
      const { data, error } = await db()
        .from("live_receipts")
        .select("*")
        .eq("receipt_id", receiptId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return { error: "Receipt not found." };
      const r = fromRow(data);
      if (r.receiptStatus !== "VALID") return { error: "Only valid receipts can be voided." };
      if (r.refundedMinor > 0) return { error: "Refund the remaining amount instead of voiding." };
      const { error: updateError } = await db()
        .from("live_receipts")
        .update({ receipt_status: "VOIDED", payment_status: "VOIDED", rev: r.rev + 1 })
        .eq("receipt_id", receiptId);
      if (updateError) throw updateError;
      return {
        record: { ...r, receiptStatus: "VOIDED", paymentStatus: "VOIDED", rev: r.rev + 1 },
      };
    },

    listWallet: async (customerId: string) => {
      const { data, error } = await db()
        .from("live_wallet")
        .select("customer_id, receipt_id, added_at, hidden")
        .eq("customer_id", customerId)
        .eq("hidden", false)
        .order("added_at", { ascending: false });
      if (error) throw error;
      return ((data ?? []) as Row[]).map(
        (w): WalletEntry => ({
          customerId: w.customer_id,
          receiptId: w.receipt_id,
          addedAt: w.added_at,
          hidden: w.hidden,
        })
      );
    },

    hideWalletEntry: async (customerId: string, receiptId: string) => {
      const { error } = await db()
        .from("live_wallet")
        .update({ hidden: true })
        .eq("customer_id", customerId)
        .eq("receipt_id", receiptId);
      if (error) throw error;
    },

    appendAudit: async (e) => {
      await insertAudit(e);
    },

    listAudit: async (receiptId: string) => {
      const { data, error } = await db()
        .from("live_audit")
        .select("*")
        .eq("receipt_id", receiptId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return ((data ?? []) as Row[]).map(
        (a): AuditEvent => ({
          id: a.id,
          receiptId: a.receipt_id,
          type: a.type,
          detail: a.detail,
          amountMinor: a.amount_minor,
          actor: a.actor,
          at: a.created_at,
        })
      );
    },

    logVerify: async (e) => {
      const { error } = await db().from("live_verify_log").insert({
        receipt_id: e.receiptId,
        result: e.result,
        source: e.source,
      });
      if (error) throw error;
    },

    listVerifyLog: async (limit = 50) => {
      const { data, error } = await db()
        .from("live_verify_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return ((data ?? []) as Row[]).map(
        (v): VerifyEvent => ({
          id: v.id,
          receiptId: v.receipt_id,
          result: v.result,
          source: v.source,
          at: v.created_at,
        })
      );
    },
  };
}
