/* ============================================================
   RECEIPTI — Demo customer receipts (Phase 04)
   One seed per customer-visible state. Tax values follow the
   5% inclusive-VAT engine (see lib/pos.inclusiveTaxMinor).
   ============================================================ */
import type { PosReceipt } from "@/types/pos";

/** The hero demo: 2 × Jacket, PAID + VERIFIED. */
export const DEMO_RECEIPT_HERO: PosReceipt = {
  id: "RCPT-DXB-001",
  transactionId: "UT-DXB-20260923-001",
  reference: "RCP_8F42K9M2",
  merchant: "Urban Threads",
  branch: "Dubai Mall",
  customerName: "Ayesha Khan",
  lines: [
    { name: "Jacket", sku: "UT-JKT-01", quantity: 2, unitMinor: 150000, lineMinor: 300000 },
  ],
  subtotalMinor: 300000,
  discountMinor: 0,
  taxMinor: 14286,
  totalMinor: 300000,
  currency: "AED",
  paymentMethod: "CARD",
  paymentStatus: "PAID",
  receiptState: "READY",
  verification: "VERIFIED",
  issuedAt: "2026-09-23T13:42:00+04:00",
};

/** Fully refunded, still authentic: REFUNDED + VERIFIED. */
export const DEMO_RECEIPT_REFUNDED: PosReceipt = {
  id: "RCPT-DXB-002",
  transactionId: "UT-DXB-20260921-004",
  reference: "RCP_7K2M9QXA",
  merchant: "Urban Threads",
  branch: "Dubai Mall",
  customerName: "Ayesha Khan",
  lines: [
    { name: "Sneakers", sku: "UT-SNK-02", quantity: 1, unitMinor: 65000, lineMinor: 65000 },
  ],
  subtotalMinor: 65000,
  discountMinor: 0,
  taxMinor: 3095,
  totalMinor: 65000,
  currency: "AED",
  paymentMethod: "CARD",
  paymentStatus: "PAID",
  receiptState: "READY",
  verification: "VERIFIED",
  refunds: [
    {
      id: "rf-demo-001",
      amountMinor: 65000,
      reason: "Customer return — wrong size",
      createdAt: "2026-09-22T11:05:00+04:00",
      label: "Full refund",
    },
  ],
  issuedAt: "2026-09-21T17:20:00+04:00",
};

/** Partially refunded: PARTIALLY_REFUNDED + VERIFIED. */
export const DEMO_RECEIPT_PARTIAL: PosReceipt = {
  id: "RCPT-DXB-003",
  transactionId: "UT-DXB-20260920-002",
  reference: "RCP_3P5RT2WQ",
  merchant: "Urban Threads",
  branch: "Dubai Mall",
  customerName: "Ayesha Khan",
  lines: [
    { name: "T-Shirt", sku: "UT-TSH-03", quantity: 2, unitMinor: 18000, lineMinor: 36000 },
    { name: "Cap", sku: "UT-CAP-06", quantity: 1, unitMinor: 12000, lineMinor: 12000 },
  ],
  subtotalMinor: 48000,
  discountMinor: 0,
  taxMinor: 2286,
  totalMinor: 48000,
  currency: "AED",
  paymentMethod: "DIGITAL",
  paymentStatus: "PAID",
  receiptState: "READY",
  verification: "VERIFIED",
  refunds: [
    {
      id: "rf-demo-002",
      amountMinor: 18000,
      reason: "Customer return — 1 × T-Shirt",
      createdAt: "2026-09-21T10:12:00+04:00",
      label: "Partial refund",
    },
  ],
  issuedAt: "2026-09-20T19:02:00+04:00",
};

/** Verification service unreachable: PAID + UNAVAILABLE. */
export const DEMO_RECEIPT_UNAVAILABLE: PosReceipt = {
  id: "RCPT-DXB-004",
  transactionId: "UT-DXB-20260919-006",
  reference: "RCP_9D4F6H8J",
  merchant: "Urban Threads",
  branch: "Dubai Mall",
  customerName: "Ayesha Khan",
  lines: [
    { name: "Hoodie", sku: "UT-HDD-05", quantity: 1, unitMinor: 28000, lineMinor: 28000 },
    { name: "Jeans", sku: "UT-JNS-04", quantity: 1, unitMinor: 32000, lineMinor: 32000 },
  ],
  subtotalMinor: 60000,
  discountMinor: 0,
  taxMinor: 2857,
  totalMinor: 60000,
  currency: "AED",
  paymentMethod: "CASH",
  paymentStatus: "PAID",
  receiptState: "READY",
  verification: "UNAVAILABLE",
  issuedAt: "2026-09-19T12:30:00+04:00",
};

/** Paid clothing purchase (Phase 09 merchant demo). */
export const DEMO_RECEIPT_UT_JEANS: PosReceipt = {
  id: "RCPT-DXB-005",
  transactionId: "UT-DXB-20260922-003",
  reference: "RCP_5T8K2N4P",
  merchant: "Urban Threads",
  branch: "Dubai Mall",
  customerName: "Omar R.",
  lines: [
    { name: "Jeans", sku: "UT-JNS-04", quantity: 1, unitMinor: 32000, lineMinor: 32000 },
  ],
  subtotalMinor: 32000,
  discountMinor: 0,
  taxMinor: 1524,
  totalMinor: 32000,
  currency: "AED",
  paymentMethod: "CARD",
  paymentStatus: "PAID",
  receiptState: "READY",
  verification: "VERIFIED",
  issuedAt: "2026-09-22T15:10:00+04:00",
};

/** Paid clothing purchase with a pending full refund (Phase 09). */
export const DEMO_RECEIPT_UT_PENDING_REFUND: PosReceipt = {
  id: "RCPT-DXB-006",
  transactionId: "UT-DXB-20260923-002",
  reference: "RCP_6H3M8D7F",
  merchant: "Urban Threads",
  branch: "Dubai Mall",
  customerName: "Sara M.",
  lines: [
    { name: "T-Shirt", sku: "UT-TSH-03", quantity: 1, unitMinor: 18000, lineMinor: 18000 },
  ],
  subtotalMinor: 18000,
  discountMinor: 0,
  taxMinor: 857,
  totalMinor: 18000,
  currency: "AED",
  paymentMethod: "DIGITAL",
  paymentStatus: "PAID",
  receiptState: "READY",
  verification: "VERIFIED",
  refunds: [
    {
      id: "RF-001",
      amountMinor: 18000,
      reason: "Changed mind — item unworn",
      createdAt: "2026-09-23T14:20:00+04:00",
      label: "Full refund",
      receiptId: "RCPT-DXB-006",
      transactionId: "UT-DXB-20260923-002",
      currency: "AED",
      items: [{ sku: "UT-TSH-03", name: "T-Shirt", quantity: 1, unitMinor: 18000 }],
      status: "PENDING",
    },
  ],
  issuedAt: "2026-09-23T10:05:00+04:00",
};

/** Paid fuel purchase (Phase 09 merchant demo). */
export const DEMO_RECEIPT_FUEL_PAID: PosReceipt = {
  id: "RCPT-FUEL-001",
  transactionId: "CF-SZRD-20260922-011",
  reference: "RCP_F7K29D4Q",
  merchant: "City Fuel",
  branch: "Sheikh Zayed Rd",
  customerName: "Yusuf A.",
  lines: [
    { name: "Unleaded 91", sku: "CF-91", quantity: 42, unitMinor: 300, lineMinor: 12600, category: "Fuel" },
  ],
  subtotalMinor: 12600,
  discountMinor: 0,
  taxMinor: 600,
  totalMinor: 12600,
  currency: "AED",
  paymentMethod: "CARD",
  paymentStatus: "PAID",
  receiptState: "READY",
  verification: "VERIFIED",
  issuedAt: "2026-09-22T08:47:00+04:00",
};

/** Fuel purchase with a completed partial correction (Phase 09). */
export const DEMO_RECEIPT_FUEL_CORRECTION: PosReceipt = {
  id: "RCPT-FUEL-002",
  transactionId: "CF-SZRD-20260918-007",
  reference: "RCP_D8M31S6W",
  merchant: "City Fuel",
  branch: "Sheikh Zayed Rd",
  customerName: "Yusuf A.",
  lines: [
    { name: "Diesel", sku: "CF-DSL", quantity: 30, unitMinor: 320, lineMinor: 9600, category: "Fuel" },
  ],
  subtotalMinor: 9600,
  discountMinor: 0,
  taxMinor: 457,
  totalMinor: 9600,
  currency: "AED",
  paymentMethod: "CARD",
  paymentStatus: "PAID",
  receiptState: "READY",
  verification: "VERIFIED",
  refunds: [
    {
      id: "RF-001",
      amountMinor: 1500,
      reason: "Pump overcharge correction",
      createdAt: "2026-09-19T09:15:00+04:00",
      processedAt: "2026-09-19T09:15:00+04:00",
      label: "Partial refund",
      receiptId: "RCPT-FUEL-002",
      transactionId: "CF-SZRD-20260918-007",
      currency: "AED",
      status: "COMPLETED",
    },
  ],
  issuedAt: "2026-09-18T17:26:00+04:00",
};

/** Paid restaurant bill (Phase 09 merchant demo). */
export const DEMO_RECEIPT_DINE_PAID: PosReceipt = {
  id: "RCPT-DINE-001",
  transactionId: "MD-MRWA-20260923-005",
  reference: "RCP_9D2N4M6K",
  merchant: "Marina Diner",
  branch: "Marina Walk",
  customerName: "Maya S.",
  lines: [
    { name: "Grilled Hammour", sku: "MD-HAMMOUR", quantity: 1, unitMinor: 14500, lineMinor: 14500, category: "Dining" },
    { name: "Fresh Orange Juice", sku: "MD-OJ", quantity: 2, unitMinor: 3000, lineMinor: 6000, category: "Dining" },
  ],
  subtotalMinor: 20500,
  discountMinor: 0,
  taxMinor: 976,
  totalMinor: 20500,
  currency: "AED",
  paymentMethod: "CARD",
  paymentStatus: "PAID",
  receiptState: "READY",
  verification: "VERIFIED",
  issuedAt: "2026-09-23T13:15:00+04:00",
};

/** Restaurant bill with a completed partial refund (Phase 09). */
export const DEMO_RECEIPT_DINE_PARTIAL: PosReceipt = {
  id: "RCPT-DINE-002",
  transactionId: "MD-MRWA-20260920-003",
  reference: "RCP_3Z7P2M8D",
  merchant: "Marina Diner",
  branch: "Marina Walk",
  customerName: "Lina H.",
  lines: [
    { name: "Mezze Platter", sku: "MD-MEZZE", quantity: 1, unitMinor: 6500, lineMinor: 6500, category: "Dining" },
    { name: "Chicken Machboos", sku: "MD-MACHB", quantity: 1, unitMinor: 8500, lineMinor: 8500, category: "Dining" },
    { name: "Um Ali", sku: "MD-UMALI", quantity: 1, unitMinor: 4500, lineMinor: 4500, category: "Dining" },
  ],
  subtotalMinor: 19500,
  discountMinor: 0,
  taxMinor: 929,
  totalMinor: 19500,
  currency: "AED",
  paymentMethod: "DIGITAL",
  paymentStatus: "PAID",
  receiptState: "READY",
  verification: "VERIFIED",
  refunds: [
    {
      id: "RF-001",
      amountMinor: 4500,
      reason: "Dessert returned — customer request",
      createdAt: "2026-09-20T21:30:00+04:00",
      processedAt: "2026-09-20T21:30:00+04:00",
      label: "Partial refund",
      receiptId: "RCPT-DINE-002",
      transactionId: "MD-MRWA-20260920-003",
      currency: "AED",
      items: [{ sku: "MD-UMALI", name: "Um Ali", quantity: 1, unitMinor: 4500 }],
      status: "COMPLETED",
    },
  ],
  issuedAt: "2026-09-20T20:40:00+04:00",
};

/** Paid electronics purchase (Phase 09 merchant demo). */
export const DEMO_RECEIPT_VOLT_PAID: PosReceipt = {
  id: "RCPT-VOLT-001",
  transactionId: "VE-MOE-20260923-002",
  reference: "RCP_8V4T1E6N",
  merchant: "Volt Electronics",
  branch: "Mall of the Emirates",
  customerName: "Bilal K.",
  lines: [
    {
      name: "Wireless Headphones",
      sku: "VE-HEADP",
      quantity: 1,
      unitMinor: 89900,
      lineMinor: 89900,
      variant: "Midnight Black",
      color: "Midnight Black",
      category: "Electronics",
    },
  ],
  subtotalMinor: 89900,
  discountMinor: 0,
  taxMinor: 4281,
  totalMinor: 89900,
  currency: "AED",
  paymentMethod: "CARD",
  paymentStatus: "PAID",
  receiptState: "READY",
  verification: "VERIFIED",
  issuedAt: "2026-09-23T11:58:00+04:00",
};

/** Small electronics purchase, verification unreachable (Phase 09). */
export const DEMO_RECEIPT_VOLT_UNAVAILABLE: PosReceipt = {
  id: "RCPT-VOLT-002",
  transactionId: "VE-MOE-20260917-001",
  reference: "RCP_2C7B5U1S",
  merchant: "Volt Electronics",
  branch: "Mall of the Emirates",
  lines: [
    { name: "USB-C Cable", sku: "VE-CABLE", quantity: 2, unitMinor: 1200, lineMinor: 2400, category: "Electronics" },
    { name: "Phone Case", sku: "VE-CASE", quantity: 1, unitMinor: 5500, lineMinor: 5500, category: "Electronics" },
  ],
  subtotalMinor: 7900,
  discountMinor: 0,
  taxMinor: 376,
  totalMinor: 7900,
  currency: "AED",
  paymentMethod: "CASH",
  paymentStatus: "PAID",
  receiptState: "READY",
  verification: "UNAVAILABLE",
  issuedAt: "2026-09-17T16:33:00+04:00",
};

/** Overcharged demo: items add to AED 480.00 but the total is AED 660.00 — feeds the customer Alerts demo. */
export const DEMO_RECEIPT_UT_OVERCHARGE: PosReceipt = {
  id: "RCPT-DXB-007",
  transactionId: "UT-DXB-20260923-007",
  reference: "RCP_4M9Q2X7T",
  merchant: "Urban Threads",
  branch: "Dubai Mall",
  customerName: "Ayesha Khan",
  lines: [
    { name: "T-Shirt", sku: "UT-TSH-03", quantity: 2, unitMinor: 18000, lineMinor: 36000 },
    { name: "Cap", sku: "UT-CAP-06", quantity: 1, unitMinor: 12000, lineMinor: 12000 },
  ],
  subtotalMinor: 48000,
  discountMinor: 0,
  taxMinor: 3143,
  totalMinor: 66000,
  currency: "AED",
  paymentMethod: "CARD",
  paymentStatus: "PAID",
  receiptState: "READY",
  verification: "VERIFIED",
  issuedAt: "2026-09-23T18:20:00+04:00",
};

export const DEMO_RECEIPTS: PosReceipt[] = [
  DEMO_RECEIPT_HERO,
  DEMO_RECEIPT_REFUNDED,
  DEMO_RECEIPT_PARTIAL,
  DEMO_RECEIPT_UNAVAILABLE,
  DEMO_RECEIPT_UT_JEANS,
  DEMO_RECEIPT_UT_PENDING_REFUND,
  DEMO_RECEIPT_FUEL_PAID,
  DEMO_RECEIPT_FUEL_CORRECTION,
  DEMO_RECEIPT_DINE_PAID,
  DEMO_RECEIPT_DINE_PARTIAL,
  DEMO_RECEIPT_VOLT_PAID,
  DEMO_RECEIPT_VOLT_UNAVAILABLE,
  DEMO_RECEIPT_UT_OVERCHARGE,
];

/** Special demo reference that simulates a still-syncing receipt. */
export const SYNC_DEMO_REF = "sync-demo";
