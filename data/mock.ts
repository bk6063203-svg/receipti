/* ============================================================
   RECEIPTI — Mock data (Phase 01)
   Local fixtures only. Components must consume these through
   lib/data.ts so swapping in a real API touches one file.
   ============================================================ */
import type {
  ApiKey,
  Branch,
  Customer,
  Integration,
  Merchant,
  Receipt,
  RefundTransaction,
  VerificationEvent,
} from "@/types";

export const mockBranches: Branch[] = [
  {
    id: "br-001",
    merchantId: "m-001",
    name: "DHA Phase 5 Branch",
    address: "Plaza 12, Commercial Broadway, DHA Phase 5",
    city: "Lahore",
    phone: "+92 42 3577 0001",
  },
  {
    id: "br-002",
    merchantId: "m-001",
    name: "Gulberg Greens Outlet",
    address: "14-B Main Boulevard, Gulberg Greens",
    city: "Lahore",
  },
];

export const mockMerchant: Merchant = {
  id: "m-001",
  name: "City Fresh Mart",
  legalName: "City Fresh Mart (Pvt.) Ltd.",
  ntn: "1234567-8",
  supportEmail: "support@cityfreshmart.pk",
  supportPhone: "+92 42 3577 0000",
  branches: mockBranches,
};

export const mockCustomer: Customer = {
  id: "c-001",
  name: "Ayesha Khan",
  email: "ayesha.khan@example.com",
  phone: "+92 300 1234567",
};

export const mockReceipts: Receipt[] = [
  {
    id: "r-001",
    receiptNumber: "RCP-2026-004213",
    merchant: mockMerchant,
    branch: mockBranches[0]!,
    customer: mockCustomer,
    issuedAt: "2026-09-20T18:24:00+05:00",
    paidAt: "2026-09-20T18:26:00+05:00",
    items: [
      {
        id: "ri-001",
        name: "Organic Basmati Rice 5kg",
        sku: "GRN-1024",
        quantity: 1,
        unitPrice: { amountMinor: 485000, currency: "PKR" },
        discountMinor: 25000,
        taxMinor: 0,
        lineTotal: { amountMinor: 460000, currency: "PKR" },
      },
      {
        id: "ri-002",
        name: "Fresh Milk 1L (Pack of 6)",
        sku: "DRY-2088",
        quantity: 1,
        unitPrice: { amountMinor: 129000, currency: "PKR" },
        discountMinor: 0,
        taxMinor: 0,
        lineTotal: { amountMinor: 129000, currency: "PKR" },
      },
      {
        id: "ri-003",
        name: "Whole Wheat Flour 10kg",
        sku: "GRN-1101",
        quantity: 2,
        unitPrice: { amountMinor: 98500, currency: "PKR" },
        discountMinor: 0,
        taxMinor: 0,
        lineTotal: { amountMinor: 197000, currency: "PKR" },
      },
    ],
    totals: {
      subtotal: { amountMinor: 811000, currency: "PKR" },
      discountTotal: { amountMinor: 25000, currency: "PKR" },
      taxTotal: { amountMinor: 39300, currency: "PKR" },
      grandTotal: { amountMinor: 825300, currency: "PKR" },
    },
    paymentMethod: "CARD",
    paymentReference: "•••• 4412",
    status: "PAID",
    verification: "VERIFIED",
    verifiedAt: "2026-09-20T18:26:04+05:00",
    qrPayload: "https://receipti.pk/v/r-001",
    media: [],
  },
  {
    id: "r-002",
    receiptNumber: "RCP-2026-004198",
    merchant: mockMerchant,
    branch: mockBranches[1]!,
    customer: mockCustomer,
    issuedAt: "2026-09-18T13:02:00+05:00",
    paidAt: "2026-09-18T13:02:00+05:00",
    items: [
      {
        id: "ri-004",
        name: "Cotton Bed Sheet — King",
        sku: "HME-3301",
        quantity: 1,
        unitPrice: { amountMinor: 349900, currency: "PKR" },
        discountMinor: 0,
        taxMinor: 0,
        lineTotal: { amountMinor: 349900, currency: "PKR" },
      },
    ],
    totals: {
      subtotal: { amountMinor: 349900, currency: "PKR" },
      discountTotal: { amountMinor: 0, currency: "PKR" },
      taxTotal: { amountMinor: 17495, currency: "PKR" },
      grandTotal: { amountMinor: 367395, currency: "PKR" },
    },
    paymentMethod: "MOBILE_WALLET",
    paymentReference: "JazzCash ••• 889",
    status: "REFUNDED",
    verification: "VERIFIED",
    verifiedAt: "2026-09-18T13:02:11+05:00",
    qrPayload: "https://receipti.pk/v/r-002",
    media: [],
  },
  {
    id: "r-003",
    receiptNumber: "RCP-2026-004150",
    merchant: mockMerchant,
    branch: mockBranches[0]!,
    issuedAt: "2026-09-15T20:41:00+05:00",
    items: [
      {
        id: "ri-005",
        name: "LED Bulb 12W (Pack of 4)",
        sku: "ELC-7710",
        quantity: 1,
        unitPrice: { amountMinor: 189500, currency: "PKR" },
        discountMinor: 0,
        taxMinor: 0,
        lineTotal: { amountMinor: 189500, currency: "PKR" },
      },
    ],
    totals: {
      subtotal: { amountMinor: 189500, currency: "PKR" },
      discountTotal: { amountMinor: 0, currency: "PKR" },
      taxTotal: { amountMinor: 9475, currency: "PKR" },
      grandTotal: { amountMinor: 198975, currency: "PKR" },
    },
    paymentMethod: "CASH",
    status: "PARTIALLY_PAID",
    verification: "UNAVAILABLE",
    qrPayload: "https://receipti.pk/v/r-003",
    media: [],
  },
];

export const mockRefunds: RefundTransaction[] = [
  {
    id: "rf-001",
    receiptId: "r-002",
    amount: { amountMinor: 367395, currency: "PKR" },
    reason: "Customer return — unopened item",
    status: "COMPLETED",
    createdAt: "2026-09-19T10:15:00+05:00",
    completedAt: "2026-09-19T10:31:00+05:00",
    itemIds: ["ri-004"],
    initiatedBy: "MERCHANT",
  },
];

export const mockVerificationEvents: VerificationEvent[] = [
  {
    id: "ve-001",
    receiptId: "r-001",
    checkedAt: "2026-09-20T18:26:04+05:00",
    result: "VERIFIED",
    channel: "SYSTEM",
  },
  {
    id: "ve-002",
    receiptId: "r-002",
    checkedAt: "2026-09-19T11:00:00+05:00",
    result: "VERIFIED",
    channel: "QR_SCAN",
  },
];

export const mockIntegrations: Integration[] = [
  {
    id: "int-001",
    merchantId: "m-001",
    kind: "POS",
    provider: "Square POS",
    status: "CONNECTED",
    lastSyncedAt: "2026-09-23T06:10:00+05:00",
  },
  {
    id: "int-002",
    merchantId: "m-001",
    kind: "ERP",
    provider: "SAP Business One",
    status: "PENDING_SETUP",
  },
];

export const mockApiKeys: ApiKey[] = [
  {
    id: "key-001",
    merchantId: "m-001",
    name: "POS terminal — DHA Phase 5",
    prefix: "rcp_live_9f2…",
    scopes: ["receipts:write", "receipts:read"],
    createdAt: "2026-08-02T09:00:00+05:00",
    lastUsedAt: "2026-09-23T06:10:00+05:00",
  },
  {
    id: "key-002",
    merchantId: "m-001",
    name: "ERP sync (read-only)",
    prefix: "rcp_live_41a…",
    scopes: ["receipts:read"],
    createdAt: "2026-09-01T09:00:00+05:00",
  },
];
