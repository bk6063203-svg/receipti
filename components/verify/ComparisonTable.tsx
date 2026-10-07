"use client";

import { Check, X } from "lucide-react";
import type { PosReceipt } from "@/types/pos";
import type { FieldDifference, PresentedReceipt } from "@/types/verification";
import { formatDate, formatMoney } from "@/lib/format";
import { aed } from "@/lib/pos";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface CompareRow {
  field: string;
  label: string;
  trusted: string;
  presented: string;
  match: boolean;
}

export function buildCompareRows(
  trusted: PosReceipt,
  presented: PresentedReceipt,
  differences: FieldDifference[]
): CompareRow[] {
  const mismatch = new Set(differences.map((d) => d.field));
  const fmtTotal = (minor: number) => formatMoney(aed(minor));
  const fmtItems = (lines: { sku: string; quantity: number }[]) =>
    `${lines.reduce((n, l) => n + l.quantity, 0)} items · ${lines.map((l) => `${l.sku}×${l.quantity}`).join(", ")}`;
  return [
    { field: "merchant", label: "Merchant", trusted: trusted.merchant, presented: presented.merchant, match: !mismatch.has("merchant") },
    { field: "branch", label: "Branch", trusted: trusted.branch, presented: presented.branch, match: !mismatch.has("branch") },
    {
      field: "date",
      label: "Date",
      trusted: formatDate(trusted.issuedAt),
      presented: formatDate(presented.issuedAt),
      match: !mismatch.has("date"),
    },
    { field: "total", label: "Total", trusted: fmtTotal(trusted.totalMinor), presented: fmtTotal(presented.totalMinor), match: !mismatch.has("total") },
    { field: "items", label: "Items", trusted: fmtItems(trusted.lines), presented: fmtItems(presented.lines), match: !mismatch.has("items") },
  ];
}

function MatchIcon({ match, label }: { match: boolean; label: string }) {
  return match ? (
    <span className="inline-flex items-center gap-1 font-semibold text-[var(--r-verified)]">
      <Check className="h-4 w-4" aria-hidden="true" /> <span className="sr-only">{label} matches</span>
      <span aria-hidden="true" className="type-caption">Match</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 font-semibold text-[var(--r-danger)]">
      <X className="h-4 w-4" aria-hidden="true" /> <span className="sr-only">{label} differs</span>
      <span aria-hidden="true" className="type-caption">Differs</span>
    </span>
  );
}

/** Trusted vs presented field comparison. Table on desktop, cards on mobile. */
export function ComparisonTable({ rows }: { rows: CompareRow[] }) {
  return (
    <>
      {/* Mobile: stacked cards */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {rows.map((r) => (
          <Card
            key={r.field}
            padding="none"
            className={cn("px-4 py-3", !r.match && "border-[var(--r-danger)] bg-[var(--r-danger-muted)]/20")}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{r.label}</p>
              <MatchIcon match={r.match} label={r.label} />
            </div>
            <dl className="mt-2 space-y-1.5">
              <div className="flex justify-between gap-3">
                <dt className="type-caption text-ink-faint">Trusted</dt>
                <dd className="type-small text-right font-medium tnum">{r.trusted}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="type-caption text-ink-faint">Presented</dt>
                <dd className={cn("type-small text-right font-medium tnum", !r.match && "font-bold text-[var(--r-danger)]")}>
                  {r.presented}
                </dd>
              </div>
            </dl>
          </Card>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="surface-card hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">Trusted record versus presented receipt, field by field</caption>
            <thead>
              <tr className="border-b border-line bg-background/60">
                <th scope="col" className="type-label px-4 py-3 text-left font-semibold text-ink-muted">Field</th>
                <th scope="col" className="type-label px-4 py-3 text-left font-semibold text-ink-muted">Trusted record</th>
                <th scope="col" className="type-label px-4 py-3 text-left font-semibold text-ink-muted">Presented</th>
                <th scope="col" className="type-label px-4 py-3 text-right font-semibold text-ink-muted">Result</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.field} className={cn("border-b border-line last:border-0", !r.match && "bg-[var(--r-danger-muted)]/25")}>
                  <td className="px-4 py-3 font-semibold">{r.label}</td>
                  <td className="px-4 py-3 tnum">{r.trusted}</td>
                  <td className={cn("px-4 py-3 tnum", !r.match && "font-bold text-[var(--r-danger)]")}>{r.presented}</td>
                  <td className="px-4 py-3 text-right">
                    <MatchIcon match={r.match} label={r.label} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
