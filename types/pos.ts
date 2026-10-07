/* ============================================================
   RECEIPTI — POS prototype types (Phase 03)
   Local simulation only. Shaped to map onto the core domain
   types (Transaction / Receipt) when the real API lands.
   ============================================================ */
import type { Money, PaymentMethod } from "@/types";

export type ProductCategory = "Clothing" | "Footwear" | "Accessories";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  /** Tax-inclusive unit price (UAE retail convention). */
  price: Money;
  image: string;
  imageAlt: string;
  sku: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

/** Payment state — the merchant transaction, independent of receipt state. */
export type PosPaymentStatus = "UNPAID" | "PROCESSING" | "PAID" | "FAILED";

/** Receipt state — the Receipti record lifecycle. */
export type PosReceiptState = "CREATING" | "READY" | "FAILED";

/** Verification state — recognition of the record by Receipti. */
export type PosVerificationState = "VERIFIED" | "UNAVAILABLE";

export type PosPaymentMethod = Extract<PaymentMethod, "CARD" | "CASH"> | "DIGITAL";

export interface PosTransaction {
  /** Merchant transaction id, e.g. "UT-DXB-20260923-001". */
  id: string;
  merchant: string;
  branch: string;
  items: CartItem[];
  subtotalMinor: number;
  discountMinor: number;
  /** Tax portion included in prices (5% VAT basis). */
  taxMinor: number;
  totalMinor: number;
  currency: Money["currency"];
  paymentMethod: PosPaymentMethod;
  paymentStatus: PosPaymentStatus;
  createdAt: string;
}

export interface PosReceiptLine {
  name: string;
  sku: string;
  quantity: number;
  unitMinor: number;
  lineMinor: number;
  /** Merchant-provided product media (Phase 04). Absent when not supplied. */
  media?: PosReceiptMedia[];
  /** Merchant-provided product detail (Phase 08). Absent when not supplied. */
  variant?: string;
  size?: string;
  color?: string;
  category?: string;
}

/** Merchant-provided product media attached to a receipt line. */
export interface PosReceiptMedia {
  id: string;
  url: string;
  type: "image";
  alt: string;
}

/** Lifecycle state of a linked refund event (Phase 06). */
export type PosRefundStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface PosRefundItem {
  sku: string;
  name: string;
  quantity: number;
  unitMinor: number;
}

/** A refund linked to the receipt — never an overwrite (Phase 04, extended 06). */
export interface PosRefundEvent {
  id: string;
  amountMinor: number;
  reason?: string;
  createdAt: string;
  label?: string;
  /** Phase 06 fields — optional so earlier seeds stay valid. */
  receiptId?: string;
  transactionId?: string;
  currency?: string;
  items?: PosRefundItem[];
  /** Absent on legacy seeds → treated as COMPLETED. */
  status?: PosRefundStatus;
  processedAt?: string;
}

export interface PosReceipt {
  /** Receipti receipt id, e.g. "RCPT-DXB-001". */
  id: string;
  transactionId: string;
  /** Short customer-facing reference, e.g. "RCP_8F42K9M2". */
  reference: string;
  merchant: string;
  branch: string;
  lines: PosReceiptLine[];
  subtotalMinor: number;
  discountMinor: number;
  taxMinor: number;
  totalMinor: number;
  currency: Money["currency"];
  paymentMethod: PosPaymentMethod;
  paymentStatus: "PAID";
  receiptState: PosReceiptState;
  verification: PosVerificationState;
  /** Linked refund events; display status derives from these (Phase 04). */
  refunds?: PosRefundEvent[];
  /** Demo customer display name only (Phase 08). Absent when unknown. */
  customerName?: string;
  issuedAt: string;
}

/** Customer-facing transaction state, derived from linked refunds. */
export type ReceiptTxState = "PAID" | "PARTIALLY_REFUNDED" | "REFUNDED";
