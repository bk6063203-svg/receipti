/* ============================================================
   RECEIPTI — Merchant dashboard demo data (Phase 09)
   Demo only. Receipts live in data/pos-demo-receipts.ts and are
   referenced here by merchant — never duplicated or revalued.
   ============================================================ */
import type { DeliveryInfo, Merchant, VerificationEvent } from "@/types/merchant";

export const MERCHANTS: Merchant[] = [
  {
    id: "urban-threads",
    name: "Urban Threads",
    branch: "Dubai Mall — Branch 02",
    trade: "Clothing",
    posName: "Urban Threads POS",
  },
  {
    id: "city-fuel",
    name: "City Fuel",
    branch: "Sheikh Zayed Rd — Station 04",
    trade: "Fuel",
    posName: "City Fuel POS",
  },
  {
    id: "marina-diner",
    name: "Marina Diner",
    branch: "Marina Walk — Unit 12",
    trade: "Restaurant",
    posName: "Marina Dine POS",
  },
  {
    id: "volt-electronics",
    name: "Volt Electronics",
    branch: "Mall of the Emirates — Level 2",
    trade: "Electronics",
    posName: "Volt Retail POS",
  },
  {
    id: "receipti-fuel",
    name: "Receipti Fuel Station",
    branch: "Lahore — Main Boulevard",
    trade: "Fuel",
    posName: "Receipti Fuel POS",
  },
];

export const MERCHANT_IDS = MERCHANTS.map((m) => m.id);

export function merchantById(id: string): Merchant {
  return MERCHANTS.find((m) => m.id === id) ?? MERCHANTS[0]!;
}

export function merchantIdForName(name: string): string {
  return MERCHANTS.find((m) => m.name === name)?.id ?? MERCHANTS[0]!.id;
}

/** Demo delivery state per receipt reference. */
export const DELIVERY_BY_REFERENCE: Record<string, DeliveryInfo> = {
  RCP_8F42K9M2: { status: "VIEWED", method: "Wallet" },
  RCP_7K2M9QXA: { status: "DELIVERED", method: "QR" },
  RCP_3P5RT2WQ: { status: "VIEWED", method: "Web" },
  RCP_9D4F6H8J: { status: "PENDING", method: "Wallet" },
  RCP_5T8K2N4P: { status: "DELIVERED", method: "QR" },
  RCP_6H3M8D7F: { status: "DELIVERED", method: "NFC" },
  RCP_F7K29D4Q: { status: "VIEWED", method: "Wallet" },
  RCP_D8M31S6W: { status: "DELIVERED", method: "QR" },
  RCP_9D2N4M6K: { status: "VIEWED", method: "Web" },
  RCP_3Z7P2M8D: { status: "DELIVERED", method: "QR" },
  RCP_8V4T1E6N: { status: "PENDING", method: "Wallet" },
  RCP_2C7B5U1S: { status: "UNAVAILABLE" },
};

/** Reference used by the demo NOT_FOUND verification event (resolves nowhere). */
export const DEMO_UNKNOWN_REFERENCE = "RCP_QW4K9Z7X";

/** Demo verification request log. Outcomes are history, not record edits. */
export const VERIFICATION_EVENTS: VerificationEvent[] = [
  { id: "ev-ut-01", merchantId: "urban-threads", reference: "RCP_8F42K9M2", receiptId: "RCPT-DXB-001", result: "VERIFIED", requestedAt: "2026-09-23T13:50:00+04:00" },
  { id: "ev-ut-02", merchantId: "urban-threads", reference: "RCP_8F42K9M2", receiptId: "RCPT-DXB-001", result: "VERIFIED", requestedAt: "2026-09-23T16:02:00+04:00" },
  { id: "ev-ut-03", merchantId: "urban-threads", reference: "RCP_7K2M9QXA", receiptId: "RCPT-DXB-002", result: "VERIFIED", requestedAt: "2026-09-22T11:20:00+04:00" },
  {
    id: "ev-ut-04",
    merchantId: "urban-threads",
    reference: "RCP_5T8K2N4P",
    receiptId: "RCPT-DXB-005",
    result: "MISMATCH",
    requestedAt: "2026-09-22T18:44:00+04:00",
    note: "Presented total differed from the trusted record.",
  },
  { id: "ev-ut-05", merchantId: "urban-threads", reference: DEMO_UNKNOWN_REFERENCE, receiptId: null, result: "NOT_FOUND", requestedAt: "2026-09-23T09:12:00+04:00" },
  {
    id: "ev-ut-06",
    merchantId: "urban-threads",
    reference: "RCP_9D4F6H8J",
    receiptId: "RCPT-DXB-004",
    result: "UNAVAILABLE",
    requestedAt: "2026-09-19T12:35:00+04:00",
    note: "Verification service unreachable at request time.",
  },
  { id: "ev-cf-01", merchantId: "city-fuel", reference: "RCP_F7K29D4Q", receiptId: "RCPT-FUEL-001", result: "VERIFIED", requestedAt: "2026-09-22T09:05:00+04:00" },
  { id: "ev-cf-02", merchantId: "city-fuel", reference: "RCP_D8M31S6W", receiptId: "RCPT-FUEL-002", result: "VERIFIED", requestedAt: "2026-09-19T09:20:00+04:00" },
  { id: "ev-md-01", merchantId: "marina-diner", reference: "RCP_9D2N4M6K", receiptId: "RCPT-DINE-001", result: "VERIFIED", requestedAt: "2026-09-23T13:40:00+04:00" },
  { id: "ev-md-02", merchantId: "marina-diner", reference: "RCP_3Z7P2M8D", receiptId: "RCPT-DINE-002", result: "VERIFIED", requestedAt: "2026-09-20T21:05:00+04:00" },
  { id: "ev-ve-01", merchantId: "volt-electronics", reference: "RCP_8V4T1E6N", receiptId: "RCPT-VOLT-001", result: "VERIFIED", requestedAt: "2026-09-23T12:30:00+04:00" },
  { id: "ev-ve-02", merchantId: "volt-electronics", reference: "RCP_2C7B5U1S", receiptId: "RCPT-VOLT-002", result: "UNAVAILABLE", requestedAt: "2026-09-17T16:40:00+04:00" },
];
