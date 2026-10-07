/* ============================================================
   RECEIPTI — Domain types (Phase 01 foundation)
   Mock/local data only. Shaped so a real API can replace the
   data layer later without changing components.
   ============================================================ */

/** Transaction (payment) status — what happened to the money. */
export type TransactionStatus =
  | "PAID"
  | "PARTIALLY_PAID"
  | "REFUNDED"
  | "PENDING"
  | "VOID"
  | "REVERSED";

/** Verification / integrity status — is the record trustworthy? */
export type VerificationStatus =
  | "VERIFIED"
  | "INVALID"
  | "TAMPER_DETECTED"
  | "UNAVAILABLE";

export type PaymentMethod =
  | "CARD"
  | "CASH"
  | "BANK_TRANSFER"
  | "MOBILE_WALLET"
  | "OTHER";

export type Currency = "PKR" | "USD" | "AED" | "SAR" | "EUR" | "GBP";

/** Money is always stored in minor units (e.g. paisa/cents). */
export interface Money {
  amountMinor: number;
  currency: Currency;
}

/* ---------------- Merchant ---------------- */

export interface Branch {
  id: string;
  merchantId: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
}

export interface Merchant {
  id: string;
  name: string;
  legalName?: string;
  logoUrl?: string;
  ntn?: string;
  supportEmail?: string;
  supportPhone?: string;
  branches: Branch[];
}

/* ---------------- Customer ---------------- */

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

/* ---------------- Receipt ---------------- */

export interface ReceiptMedia {
  id: string;
  kind: "PRODUCT_IMAGE" | "ATTACHMENT";
  url: string;
  alt: string;
  receiptItemId?: string;
}

export interface ReceiptItem {
  id: string;
  name: string;
  sku?: string;
  quantity: number;
  unitPrice: Money;
  /** Line discount in minor units (0 when none). */
  discountMinor: number;
  /** Line tax in minor units (0 when none). */
  taxMinor: number;
  /** Line total = qty * unit - discount + tax, in minor units. */
  lineTotal: Money;
  imageUrl?: string;
}

export interface ReceiptTotals {
  subtotal: Money;
  discountTotal: Money;
  taxTotal: Money;
  grandTotal: Money;
}

export interface Receipt {
  id: string;
  /** Human-readable receipt number, e.g. "RCP-2026-004213". */
  receiptNumber: string;
  merchant: Merchant;
  branch: Branch;
  customer?: Customer;
  /** ISO-8601 timestamps. */
  issuedAt: string;
  paidAt?: string;
  items: ReceiptItem[];
  totals: ReceiptTotals;
  paymentMethod: PaymentMethod;
  /** Last 4 for cards, reference for transfers, etc. */
  paymentReference?: string;

  /** Transaction status and verification are INDEPENDENT. */
  status: TransactionStatus;
  verification: VerificationStatus;
  verifiedAt?: string;

  /** Stable reference encoded in the QR (URL or opaque token). */
  qrPayload: string;
  notes?: string;
  media: ReceiptMedia[];
}

/* ---------------- Refunds (linked events, never overwrites) ---------------- */

export type RefundStatus = "INITIATED" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface RefundTransaction {
  id: string;
  receiptId: string;
  amount: Money;
  reason: string;
  status: RefundStatus;
  createdAt: string;
  completedAt?: string;
  /** Receipt items covered by this refund (partial refunds). */
  itemIds?: string[];
  initiatedBy: "MERCHANT" | "CUSTOMER_REQUEST" | "SYSTEM";
}

/* ---------------- Verification ---------------- */

export interface VerificationEvent {
  id: string;
  receiptId: string;
  checkedAt: string;
  result: VerificationStatus;
  /** Machine-readable reason code, e.g. "HASH_MISMATCH". */
  reasonCode?: string;
  detail?: string;
  /** Scoped channel that performed the check (future: institutional access). */
  channel: "QR_SCAN" | "WALLET" | "MERCHANT_PORTAL" | "INSTITUTION" | "SYSTEM";
}

/* ---------------- Integrations / API ---------------- */

export type IntegrationKind = "POS" | "ERP" | "ECOMMERCE" | "CUSTOM";
export type IntegrationStatus = "CONNECTED" | "DISCONNECTED" | "ERROR" | "PENDING_SETUP";

export interface Integration {
  id: string;
  merchantId: string;
  kind: IntegrationKind;
  provider: string;
  status: IntegrationStatus;
  lastSyncedAt?: string;
  metadata?: Record<string, string>;
}

export interface ApiKey {
  id: string;
  merchantId: string;
  name: string;
  /** Prefix only — never expose full secrets to clients. */
  prefix: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt?: string;
  revokedAt?: string;
}

/* ---------------- Wallet (future-ready) ---------------- */

/**
 * Removing a receipt from a wallet hides it for the customer only.
 * The authoritative Receipti record is never deleted by this action.
 */
export interface WalletEntry {
  customerId: string;
  receiptId: string;
  savedAt: string;
  hiddenAt?: string;
  isFavorite?: boolean;
}

/* ---------------- Shared UI ---------------- */

export interface PageMeta {
  title: string;
  description?: string;
  breadcrumb?: { label: string; href?: string }[];
}
