"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, BadgeCheck, Loader2, ScanSearch, ShieldCheck } from "lucide-react";
import { LIVE_MERCHANT_ID } from "@/data/live-catalog";
import { formatDateTime, formatMoney } from "@/lib/format";
import {
  publicVerifyPayload,
  verifyIntegrity,
  type VerifyEvent,
  type VerifyPayload,
  type VerifyResult,
} from "@/lib/live-receipt-record";
import { pkr } from "@/lib/live-transaction";
import { getRepository } from "@/lib/receipt-repo";
import { Badge, Button, Card, EmptyState, Input } from "@/components/ui";
import { DbModeBadge } from "./DbModeBadge";

interface CheckOutcome {
  result: VerifyResult;
  payload: VerifyPayload | null;
  receiptId: string;
  at: string;
}

const RESULT_META: Record<VerifyResult, { label: string; tone: "success" | "warning" | "neutral" | "danger"; blurb: string }> = {
  VERIFIED: { label: "Verified", tone: "success", blurb: "This receipt exists in Receipti's records and its integrity check passed." },
  PARTIAL: { label: "Partially Refunded", tone: "warning", blurb: "Genuine receipt — part of the amount was refunded (see merchant audit trail)." },
  REFUNDED: { label: "Refunded", tone: "neutral", blurb: "Genuine receipt — the full amount was refunded to the customer." },
  VOIDED: { label: "Voided", tone: "danger", blurb: "Genuine receipt — voided by the merchant. It no longer represents a sale." },
  NOT_FOUND: { label: "Not Found", tone: "neutral", blurb: "No receipt with this reference exists in Receipti's records." },
  FAILED: { label: "Verification Failed", tone: "danger", blurb: "The record's integrity check failed — do not trust this receipt." },
};

function extractToken(input: string): string | null {
  const v = input.trim();
  const m = v.match(/\/live\/receipt\/([A-Za-z0-9_]+)/);
  if (m?.[1]) return m[1];
  if (/^CLM_[A-Za-z0-9]+$/.test(v)) return v;
  return null;
}

function VerifyPanel() {
  const params = useSearchParams();
  const [input, setInput] = React.useState("");
  const [checking, setChecking] = React.useState(false);
  const [outcome, setOutcome] = React.useState<CheckOutcome | null>(null);
  const [log, setLog] = React.useState<VerifyEvent[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const preset = params.get("receipt");
    if (preset) setInput(preset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reloadLog = React.useCallback(async () => {
    try {
      const repo = await getRepository();
      setLog(await repo.listVerifyLog(20));
    } catch {
      /* log stays as-is on transient failures */
    }
  }, []);

  React.useEffect(() => {
    void reloadLog();
  }, [reloadLog]);

  const check = async (raw?: string) => {
    const value = (raw ?? input).trim();
    if (value === "" || checking) return;
    setChecking(true);
    setError(null);
    try {
      const repo = await getRepository();
      const token = extractToken(value);
      const record = token ? await repo.getReceiptByToken(token) : await repo.getReceipt(value);
      const receiptId = record?.receiptId ?? value;
      let result: VerifyResult;
      let payload: VerifyPayload | null = null;
      if (!record) {
        result = "NOT_FOUND";
      } else {
        const ok = await verifyIntegrity(record);
        payload = publicVerifyPayload(record, ok);
        result = !ok
          ? "FAILED"
          : record.receiptStatus === "VALID"
            ? "VERIFIED"
            : record.receiptStatus === "PARTIAL"
              ? "PARTIAL"
              : record.receiptStatus;
      }
      await repo.logVerify({ receiptId, result, source: token ? "qr" : "manual" });
      setOutcome({ result, payload, receiptId, at: new Date().toISOString() });
      await reloadLog();
    } catch {
      setError("Verification couldn't reach the receipt store. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const fillLatest = async () => {
    try {
      const repo = await getRepository();
      const latest = (await repo.listMerchantReceipts(LIVE_MERCHANT_ID))[0];
      if (latest) {
        setInput(latest.receiptId);
        setOutcome(null);
      } else {
        setError("No demo receipts exist yet — complete a sale on the till first.");
      }
    } catch {
      setError("Couldn't reach the receipt store. Please try again.");
    }
  };

  const meta = outcome ? RESULT_META[outcome.result] : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--r-primary-muted)] text-[var(--r-primary)]">
          <ScanSearch className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="type-h1">Verify Receipt</h1>
          <p className="type-caption mt-0.5 text-ink-muted">
            Enter a Receipt ID or paste a claim link from a verification QR code.
          </p>
        </div>
        <DbModeBadge />
      </div>

      <Card className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="Receipt ID or claim link"
              placeholder="RCP_XXXXXXX or https://…/live/receipt/CLM_…"
              value={input}
              autoComplete="off"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void check();
              }}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void fillLatest()}>
              Use latest receipt
            </Button>
            <Button onClick={() => void check()} disabled={checking || input.trim() === ""}>
              {checking ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Checking…
                </span>
              ) : (
                "Verify"
              )}
            </Button>
          </div>
        </div>
        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-xl bg-[var(--r-danger-muted)] px-3.5 py-2.5 text-sm font-medium text-[var(--r-danger)]">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
        <p className="type-caption text-ink-faint">
          Camera scanning arrives with the native app — pasting the claim link from any receipt QR
          checks the same record. Verification is read-only: looking a receipt up never creates,
          copies, or alters records.
        </p>
      </Card>

      {outcome && meta && (
        <Card aria-live="polite">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={
                meta.tone === "success"
                  ? "flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--r-verified-muted)] text-[var(--r-verified)]"
                  : meta.tone === "warning"
                    ? "flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--r-warning-muted)] text-[var(--r-warning)]"
                    : meta.tone === "danger"
                      ? "flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--r-danger-muted)] text-[var(--r-danger)]"
                      : "flex h-12 w-12 items-center justify-center rounded-2xl bg-background text-ink-muted"
              }
            >
              {outcome.result === "VERIFIED" ? (
                <BadgeCheck className="h-6 w-6" aria-hidden="true" />
              ) : outcome.result === "NOT_FOUND" || outcome.result === "FAILED" ? (
                <AlertTriangle className="h-6 w-6" aria-hidden="true" />
              ) : (
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="type-h3">
                {meta.label} · <span className="font-mono" data-mono>{outcome.receiptId}</span>
              </p>
              <p className="type-small mt-0.5 text-ink-muted">{meta.blurb}</p>
            </div>
            <Badge tone={meta.tone}>{meta.label}</Badge>
          </div>
          {outcome.payload && (
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-4 sm:grid-cols-3">
              <div>
                <dt className="type-caption text-ink-faint">Merchant</dt>
                <dd className="type-small font-semibold">{outcome.payload.merchantName}</dd>
              </div>
              <div>
                <dt className="type-caption text-ink-faint">Issued</dt>
                <dd className="type-small font-semibold tnum">{formatDateTime(outcome.payload.issuedAt)}</dd>
              </div>
              <div>
                <dt className="type-caption text-ink-faint">Total</dt>
                <dd className="type-small font-semibold tnum" data-numeric>
                  {formatMoney(pkr(outcome.payload.totalMinor))}
                </dd>
              </div>
              <div>
                <dt className="type-caption text-ink-faint">Items</dt>
                <dd className="type-small font-semibold tnum">{outcome.payload.itemCount}</dd>
              </div>
              <div>
                <dt className="type-caption text-ink-faint">Integrity</dt>
                <dd className={`type-small font-bold ${outcome.payload.integrityOk ? "text-[var(--r-verified)]" : "text-[var(--r-danger)]"}`}>
                  {outcome.payload.integrityOk ? "Passed" : "Failed"}
                </dd>
              </div>
              <div>
                <dt className="type-caption text-ink-faint">Checked</dt>
                <dd className="type-small font-semibold tnum">{formatDateTime(outcome.at)}</dd>
              </div>
            </dl>
          )}
          <p className="type-caption mt-3 text-ink-faint">
            Public receipt facts only — verification never exposes customer or payment details.
          </p>
        </Card>
      )}

      <section aria-label="Verification activity">
        <h2 className="type-h3">Activity log</h2>
        {log.length === 0 ? (
          <Card className="mt-3">
            <EmptyState
              icon={<ScanSearch className="h-8 w-8" aria-hidden="true" />}
              title="No checks yet"
              description="Every verification attempt is recorded here."
            />
          </Card>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {log.map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-line bg-[var(--r-card)] px-4 py-3"
              >
                <span className="font-mono text-sm font-semibold" data-mono>{e.receiptId}</span>
                <Badge tone={RESULT_META[e.result].tone}>{RESULT_META[e.result].label}</Badge>
                <span className="type-caption text-ink-faint">{e.source === "qr" ? "QR link" : "Manual entry"}</span>
                <span className="type-caption ml-auto text-ink-faint tnum">{formatDateTime(e.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function VerifyView() {
  return (
    <Suspense fallback={<Card aria-busy="true" aria-label="Loading verification"><div className="h-24 animate-pulse rounded-xl bg-background" /></Card>}>
      <VerifyPanel />
    </Suspense>
  );
}
