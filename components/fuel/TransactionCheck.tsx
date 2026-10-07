"use client";

import Link from "next/link";
import { AlertTriangle, Check, Flag, ReceiptText, SearchX } from "lucide-react";
import type {
  FieldComparison,
  FuelCheckResult,
  FuelRecord,
  PresentedFuelInfo,
} from "@/lib/fuel-check";
import { Button, Card, Input, LoadingState, Select } from "@/components/ui";
import { cn } from "@/lib/utils";

export type FuelScenario = "matching" | "amount" | "quantity" | "fuel-type" | "not-found";

const SCENARIOS: { id: FuelScenario; label: string; hint: string }[] = [
  { id: "matching", label: "Matching transaction", hint: "Presented figures equal the record." },
  { id: "amount", label: "Amount mismatch", hint: "Presented total is PKR 500.00 higher." },
  { id: "quantity", label: "Quantity mismatch", hint: "Presented quantity is 1.00 L higher." },
  { id: "fuel-type", label: "Fuel type mismatch", hint: "Diesel presented, Petrol recorded." },
  { id: "not-found", label: "Receipt not found", hint: "No record resolves for the reference." },
];

function VerdictPill({ status }: { status: FieldComparison["status"] }) {
  return (
    <span
      className={cn(
        "type-status inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1",
        status === "MATCH"
          ? "bg-[var(--r-verified-muted)] text-[var(--r-verified)]"
          : "bg-[var(--r-warning-muted)] text-[var(--r-warning)]"
      )}
    >
      {status === "MATCH" ? (
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {status === "MATCH" ? "Match" : "Mismatch"}
    </span>
  );
}

export function TransactionCheck({
  record,
  recordStatus,
  receiptRef,
  scenario,
  onScenario,
  presented,
  onPresented,
  result,
  reported,
  onReport,
}: {
  record: FuelRecord | null;
  recordStatus: "idle" | "loading" | "found" | "not-found";
  receiptRef: string | null;
  scenario: FuelScenario | "custom";
  onScenario: (s: FuelScenario) => void;
  presented: PresentedFuelInfo;
  onPresented: (p: PresentedFuelInfo) => void;
  result: FuelCheckResult | null;
  reported: boolean;
  onReport: () => void;
}) {
  const set = (key: keyof PresentedFuelInfo, value: string) => onPresented({ ...presented, [key]: value });
  const differing = result?.fields.filter((f) => f.status === "MISMATCH") ?? [];
  const mismatch = result !== null && !result.allMatch;

  return (
    <Card as="section" aria-label="Transaction check" className="flex flex-col gap-6">
      <div>
        <p className="type-label text-[var(--r-primary)]">Transaction check</p>
        <h2 className="type-h3 mt-1">Customer-presented information vs Receipti record</h2>
        <p className="type-small mt-1 max-w-2xl text-ink-muted">
          Enter the figures as they were presented to you — from the pump display, a
          paper slip, or a message — and Receipti compares them against the available
          receipt record. Differences are reported factually.
        </p>
      </div>

      <fieldset>
        <legend className="type-label text-ink-faint">Demo scenario</legend>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5" role="radiogroup" aria-label="Demo scenario">
          {SCENARIOS.map((s) => (
            <label
              key={s.id}
              className={cn(
                "flex cursor-pointer items-start gap-2.5 rounded-xl border px-3.5 py-3 transition-colors",
                scenario === s.id
                  ? "border-[var(--r-primary)] bg-[var(--r-primary-muted)]/40"
                  : "border-line hover:bg-background"
              )}
            >
              <input
                type="radio"
                name="fuel-scenario"
                value={s.id}
                checked={scenario === s.id}
                onChange={() => onScenario(s.id)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--r-primary)]"
              />
              <span>
                <span className="block text-sm font-semibold">{s.label}</span>
                <span className="type-caption block text-ink-muted">{s.hint}</span>
              </span>
            </label>
          ))}
        </div>
        {scenario === "custom" && (
          <p className="type-small mt-2 text-ink-muted" role="status">
            Custom figures — edited by you. The result below updates automatically.
          </p>
        )}
      </fieldset>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line p-4 sm:p-5">
          <h3 className="type-label text-ink-faint">Customer-presented information</h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              label="Fuel type"
              value={presented.fuelType}
              onChange={(e) => set("fuelType", e.target.value)}
              options={[
                { value: "Petrol", label: "Petrol" },
                { value: "Diesel", label: "Diesel" },
                { value: "Hi-Octane", label: "Hi-Octane" },
              ]}
            />
            <Input
              label="Quantity (L)"
              inputMode="decimal"
              value={presented.quantityL}
              onChange={(e) => set("quantityL", e.target.value)}
              hint="As shown on the pump or slip."
            />
            <Input
              label="Price / litre"
              inputMode="decimal"
              value={presented.pricePerL}
              onChange={(e) => set("pricePerL", e.target.value)}
            />
            <Input
              label="Total"
              inputMode="decimal"
              value={presented.total}
              onChange={(e) => set("total", e.target.value)}
            />
            <div className="sm:col-span-2">
              <Input
                label="Transaction ID"
                value={presented.transactionId}
                onChange={(e) => set("transactionId", e.target.value)}
                hint="Compared exactly."
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-background/50 p-4 sm:p-5">
          <h3 className="type-label text-ink-faint">Receipti transaction record</h3>
          {recordStatus === "idle" && (
            <p className="type-small mt-3 rounded-xl bg-[var(--r-card)] px-3.5 py-3 text-ink-muted">
              Complete the fuel transaction above to create the authoritative record.
            </p>
          )}
          {recordStatus === "loading" && (
            <div className="mt-3">
              <LoadingState variant="skeleton" lines={4} label="Locating receipt record…" />
            </div>
          )}
          {recordStatus === "not-found" && (
            <div className="mt-3 rounded-xl bg-[var(--r-card)] px-4 py-4">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                <SearchX className="h-4 w-4 text-ink-muted" aria-hidden="true" />
                Receipt not found
              </p>
              <p className="type-small mt-1.5 text-ink-muted">
                Receipti could not locate a matching transaction record. Possible reasons:
              </p>
              <ul className="type-small mt-2 list-disc space-y-1 pl-5 text-ink-muted">
                <li>Incorrect reference</li>
                <li>Transaction not synchronized</li>
                <li>Record unavailable</li>
              </ul>
              <p className="type-small mt-2 font-medium">
                This does not mean the transaction never happened.
              </p>
            </div>
          )}
          {recordStatus === "found" && record && result && (
            <dl className="mt-3 space-y-2">
              {result.fields.map((f) => (
                <div key={f.field} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--r-card)] px-3.5 py-2.5">
                  <dt className="type-small text-ink-muted">{f.label}</dt>
                  <dd className="type-small text-right font-semibold tnum">{f.recorded}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      {mismatch && (
        <div
          role="alert"
          className="flex flex-col gap-2 rounded-2xl border border-[var(--r-warning)]/40 bg-[var(--r-warning-muted)]/50 px-4 py-3.5 sm:flex-row sm:items-center"
        >
          <p className="type-small min-w-0 flex-1">
            <span className="font-bold uppercase tracking-wide">Transaction check — </span>
            a difference was found between the transaction information you entered and
            the Receipti record.
          </p>
          <a href="#check-result" className="type-small shrink-0 font-semibold text-[var(--r-primary)] underline underline-offset-2">
            Review transaction
          </a>
        </div>
      )}

      <div id="check-result" className="scroll-mt-24">
        {result === null ? (
          <p className="type-small rounded-2xl border border-dashed border-line px-4 py-4 text-center text-ink-muted" role="status">
            {recordStatus === "not-found"
              ? "No comparison is possible without a receipt record."
              : "The comparison result appears here once the record loads."}
          </p>
        ) : result.allMatch ? (
          <div className="rounded-2xl border border-[var(--r-verified)]/30 bg-[var(--r-verified-muted)]/40 px-4 py-4" role="status">
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--r-verified)]">
              <Check className="h-4 w-4" aria-hidden="true" />
              Transaction matched
            </p>
            <p className="type-small mt-1.5">
              Transaction information matches the Receipti record. Matched fields:{" "}
              <span className="font-bold tnum" data-numeric>
                {result.matched} / {result.total}
              </span>
              .
            </p>
            {result.arithmeticNote && (
              <p className="type-caption mt-1 text-ink-muted">{result.arithmeticNote}</p>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--r-warning)]/40 bg-[var(--r-warning-muted)]/40 px-4 py-4" role="status">
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--r-warning)]">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              Discrepancy detected
            </p>
            <p className="type-small mt-1.5">
              Receipti found a difference between the presented transaction information
              and the available receipt record. {differing.length}{" "}
              {differing.length === 1 ? "field differs" : "fields differ"} — matched{" "}
              <span className="font-bold tnum" data-numeric>
                {result.matched} / {result.total}
              </span>
              .
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {differing.map((f) => (
                <li key={f.field} className="type-small rounded-xl bg-[var(--r-card)] px-3.5 py-2.5">
                  <span className="font-semibold">{f.label}</span>
                  <span className="mt-0.5 block text-ink-muted tnum">
                    Presented: {f.presented} · Recorded: {f.recorded}
                    {f.difference ? (
                      <>
                        {" · "}Difference: <span className="font-bold text-ink">{f.difference}</span>
                      </>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
            {result.arithmeticNote && (
              <p className="type-caption mt-2 text-ink-muted">{result.arithmeticNote}</p>
            )}
          </div>
        )}
      </div>

      {result && (
        <details className="group rounded-2xl border border-line px-4 py-3.5">
          <summary className="cursor-pointer text-sm font-semibold transition-colors hover:text-[var(--r-primary)]">
            Discrepancy details — field by field
          </summary>
          <ul className="mt-3 flex flex-col gap-2">
            {result.fields.map((f) => (
              <li
                key={f.field}
                className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl bg-background px-3.5 py-2.5"
              >
                <span className="type-small min-w-[7rem] flex-1 font-semibold">{f.label}</span>
                <span className="type-small text-ink-muted tnum">Presented: {f.presented}</span>
                <span className="type-small text-ink-muted tnum">Recorded: {f.recorded}</span>
                <span className="type-small text-ink-muted tnum">
                  Difference: {f.difference ?? "—"}
                </span>
                <VerdictPill status={f.status} />
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        {receiptRef && (
          <Link href={`/receipt/${receiptRef}`} className="flex-1">
            <Button variant="outline" className="w-full" leftIcon={<ReceiptText className="h-4 w-4" aria-hidden="true" />}>
              View receipt record
            </Button>
          </Link>
        )}
        {mismatch && (
          <Button
            variant="ghost"
            className="flex-1"
            onClick={onReport}
            disabled={reported}
            leftIcon={<Flag className="h-4 w-4" aria-hidden="true" />}
          >
            {reported ? "Discrepancy noted (demo)" : "Report discrepancy"}
          </Button>
        )}
      </div>
      {reported && (
        <p className="type-caption -mt-3 text-ink-faint" role="status">
          Simulated only — no complaint was filed and nothing left the browser.
        </p>
      )}
    </Card>
  );
}
