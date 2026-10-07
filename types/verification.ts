/* ============================================================
   RECEIPTI — Verification types (Phase 05)
   Local prototype logic over the Phase 03/04 PosReceipt record.
   No new receipt architecture — the trusted record IS PosReceipt.
   ============================================================ */
import type { PosReceipt } from "@/types/pos";

/** Verification outcome — reported facts, never accusations. */
export type VerifyOutcome = "VERIFIED" | "MISMATCH" | "NOT_FOUND" | "UNAVAILABLE";

/**
 * The receipt as presented for checking (e.g. details from a scan).
 * Structurally the same record; tamper demos alter a copy of it.
 */
export interface PresentedReceipt {
  merchant: string;
  branch: string;
  /** ISO date of issue (day precision is what gets compared). */
  issuedAt: string;
  totalMinor: number;
  currency: PosReceipt["currency"];
  /** Canonical item signature, e.g. "UT-JKT-01:2:150000". */
  lines: { sku: string; name: string; quantity: number; unitMinor: number; lineMinor: number }[];
}

export interface FieldDifference {
  field: "merchant" | "branch" | "date" | "total" | "items";
  label: string;
  trusted: string;
  presented: string;
}

export interface VerificationResultData {
  status: VerifyOutcome;
  /** The reference that was looked up. */
  reference: string;
  receiptId?: string;
  /** Trusted record (absent for NOT_FOUND / hard UNAVAILABLE). */
  trusted?: PosReceipt;
  presented?: PresentedReceipt;
  differences: FieldDifference[];
  verifiedAt: string;
  /**
   * Demo integrity fingerprints (FNV-1a over canonical fields).
   * PROTOTYPE ONLY — not a production signature scheme.
   */
  trustedFingerprint?: string;
  presentedFingerprint?: string;
  /** Human-readable reason for NOT_FOUND / UNAVAILABLE. */
  reason?: string;
}

/** Demo-only alterations applied to the presented copy. */
export type TamperKind = "total" | "date" | "merchant" | "items";
