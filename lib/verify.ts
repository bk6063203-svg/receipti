/* ============================================================
   RECEIPTI — Verification engine (Phase 05)
   Pure functions + one async lookup. Compares a presented
   receipt against the trusted local record and reports facts.
   Prototype string/field comparison only — NOT production
   cryptographic verification (labeled as such in the UI).
   ============================================================ */
import { loadReceipt } from "@/lib/receipt-loader";
import { formatMoney } from "@/lib/format";
import type { PosReceipt } from "@/types/pos";
import type {
  FieldDifference,
  PresentedReceipt,
  TamperKind,
  VerificationResultData,
} from "@/types/verification";

/* ---------------- reference handling ---------------- */

/** Accept a bare reference or a pasted /receipt/ or /verify/ URL. */
export function extractReference(input: string): string {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/\/(?:receipt|r|verify)\/([A-Za-z0-9_-]+)\/?(?:\?.*)?$/);
  if (urlMatch?.[1]) return urlMatch[1].toUpperCase();
  return trimmed.toUpperCase();
}

export function isPlausibleReference(ref: string): boolean {
  if (/^(RCP_[A-Z0-9]{4,12}|SYNC-DEMO)$/.test(ref)) return true;
  // Receipt numbers (RCPT-…) and transaction ids are also accepted —
  // lookup resolves them to the trusted record.
  return /^[A-Z0-9][A-Z0-9-]{3,31}$/.test(ref);
}

/* ---------------- presented copy + tamper demos ---------------- */

export function presentedFromReceipt(receipt: PosReceipt): PresentedReceipt {
  return {
    merchant: receipt.merchant,
    branch: receipt.branch,
    issuedAt: receipt.issuedAt,
    totalMinor: receipt.totalMinor,
    currency: receipt.currency,
    lines: receipt.lines.map((l) => ({
      sku: l.sku,
      name: l.name,
      quantity: l.quantity,
      unitMinor: l.unitMinor,
      lineMinor: l.lineMinor,
    })),
  };
}

/** Demo-only: alter one aspect of the presented copy. */
export function applyTamper(presented: PresentedReceipt, kind: TamperKind): PresentedReceipt {
  const copy: PresentedReceipt = { ...presented, lines: presented.lines.map((l) => ({ ...l })) };
  switch (kind) {
    case "total":
      copy.totalMinor = presented.totalMinor + 100000; // +AED 1,000
      break;
    case "date": {
      const d = new Date(presented.issuedAt);
      d.setDate(d.getDate() + 1);
      copy.issuedAt = d.toISOString();
      break;
    }
    case "merchant":
      copy.merchant = "Urban Threadz";
      break;
    case "items": {
      const first = copy.lines[0];
      if (first) {
        first.quantity += 1;
        first.lineMinor = first.quantity * first.unitMinor;
        // Keep the presented total self-consistent so only Items differs.
        copy.totalMinor = copy.lines.reduce((s, l) => s + l.lineMinor, 0);
      }
      break;
    }
  }
  return copy;
}

/* ---------------- demo integrity fingerprint ---------------- */

/** FNV-1a 32-bit — demo fingerprint only, not cryptographic. */
function fnv1a(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0").toUpperCase();
}

function canonical(receipt: PosReceipt): string {
  const lines = receipt.lines
    .map((l) => `${l.sku}:${l.quantity}:${l.unitMinor}:${l.lineMinor}`)
    .join("|");
  return [receipt.merchant, receipt.branch, receipt.issuedAt, receipt.totalMinor, lines].join("~");
}

function canonicalPresented(p: PresentedReceipt): string {
  const lines = p.lines.map((l) => `${l.sku}:${l.quantity}:${l.unitMinor}:${l.lineMinor}`).join("|");
  return [p.merchant, p.branch, p.issuedAt, p.totalMinor, lines].join("~");
}

export function fingerprintOfReceipt(r: PosReceipt): string {
  return fnv1a(canonical(r));
}

export function fingerprintOfPresented(p: PresentedReceipt): string {
  return fnv1a(canonicalPresented(p));
}

/* ---------------- comparison ---------------- */

function dayOf(iso: string): string {
  return iso.slice(0, 10);
}

function linesSignature(lines: PresentedReceipt["lines"]): string {
  return lines.map((l) => `${l.sku}×${l.quantity}`).join(", ");
}

export function compareReceipts(
  trusted: PosReceipt,
  presented: PresentedReceipt
): FieldDifference[] {
  const diffs: FieldDifference[] = [];
  if (trusted.merchant !== presented.merchant) {
    diffs.push({ field: "merchant", label: "Merchant", trusted: trusted.merchant, presented: presented.merchant });
  }
  if (trusted.branch !== presented.branch) {
    diffs.push({ field: "branch", label: "Branch", trusted: trusted.branch, presented: presented.branch });
  }
  if (dayOf(trusted.issuedAt) !== dayOf(presented.issuedAt)) {
    diffs.push({
      field: "date",
      label: "Date",
      trusted: dayOf(trusted.issuedAt),
      presented: dayOf(presented.issuedAt),
    });
  }
  if (trusted.totalMinor !== presented.totalMinor) {
    diffs.push({
      field: "total",
      label: "Total",
      trusted: formatMoney({ amountMinor: trusted.totalMinor, currency: trusted.currency }),
      presented: formatMoney({ amountMinor: presented.totalMinor, currency: presented.currency }),
    });
  }
  const trustedLines = trusted.lines.map((l) => ({ ...l }));
  if (linesSignature(trustedLines) !== linesSignature(presented.lines)) {
    diffs.push({
      field: "items",
      label: "Items",
      trusted: `${trusted.lines.reduce((n, l) => n + l.quantity, 0)} items (${linesSignature(trustedLines)})`,
      presented: `${presented.lines.reduce((n, l) => n + l.quantity, 0)} items (${linesSignature(presented.lines)})`,
    });
  }
  return diffs;
}

/* ---------------- verification entry point ---------------- */

export interface VerifyOptions {
  tamper?: TamperKind;
  forceUnavailable?: boolean;
}

export async function verifyReference(
  rawInput: string,
  opts: VerifyOptions = {}
): Promise<VerificationResultData> {
  const reference = extractReference(rawInput);
  const verifiedAt = new Date().toISOString();

  if (reference === "" || !isPlausibleReference(reference)) {
    return {
      status: "NOT_FOUND",
      reference: reference || "(empty)",
      differences: [],
      verifiedAt,
      reason:
        reference === ""
          ? "No reference was provided."
          : "This doesn't look like a Receipti reference.",
    };
  }

  if (opts.forceUnavailable) {
    return {
      status: "UNAVAILABLE",
      reference,
      differences: [],
      verifiedAt,
      reason: "The Receipti record could not be retrieved right now. (Demo: forced outage.)",
    };
  }

  const loaded = await loadReceipt(reference);
  if (loaded.kind === "not-found" || loaded.kind === "syncing") {
    return {
      status: "NOT_FOUND",
      reference,
      differences: [],
      verifiedAt,
      reason:
        loaded.kind === "syncing"
          ? "This receipt is still syncing and isn't checkable yet."
          : undefined,
    };
  }

  const trusted = loaded.receipt;

  // The record exists but the verification layer can't vouch for it right now.
  if (trusted.verification === "UNAVAILABLE") {
    return {
      status: "UNAVAILABLE",
      reference,
      receiptId: trusted.id,
      trusted,
      differences: [],
      verifiedAt,
      reason: "The verification service could not be reached. The record itself was retrieved.",
    };
  }

  const presented = opts.tamper
    ? applyTamper(presentedFromReceipt(trusted), opts.tamper)
    : presentedFromReceipt(trusted);
  const differences = compareReceipts(trusted, presented);

  return {
    status: differences.length === 0 ? "VERIFIED" : "MISMATCH",
    reference,
    receiptId: trusted.id,
    trusted,
    presented,
    differences,
    verifiedAt,
    trustedFingerprint: fingerprintOfReceipt(trusted),
    presentedFingerprint: fingerprintOfPresented(presented),
  };
}
