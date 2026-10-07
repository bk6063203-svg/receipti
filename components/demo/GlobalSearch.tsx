"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DEMO_RECEIPTS } from "@/data/pos-demo-receipts";
import { listStoredReceipts } from "@/lib/pos-store";
import { formatMoney } from "@/lib/format";
import { receiptTxState } from "@/lib/pos";
import { SearchInput } from "@/components/ui";
import { TxPill } from "@/components/merchant";
import { humanizeStatus } from "@/lib/format";

/** Prototype-wide receipt search: id, transaction, merchant, or product. */
export function GlobalSearch() {
  const [q, setQ] = React.useState("");
  const query = q.trim().toLowerCase();
  const results = React.useMemo(() => {
    if (query === "") return [];
    const byRef = new Map(DEMO_RECEIPTS.map((r) => [r.reference, r]));
    for (const r of listStoredReceipts()) byRef.set(r.reference, r);
    return [...byRef.values()]
      .filter((r) =>
        [r.id, r.transactionId, r.reference, r.merchant, ...r.lines.map((l) => `${l.name} ${l.sku}`)]
          .join(" ")
          .toLowerCase()
          .includes(query)
      )
      .slice(0, 6);
  }, [query]);

  return (
    <div>
      <SearchInput
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onClear={() => setQ("")}
        placeholder="Search receipts by ID, transaction, merchant, or product…"
        aria-label="Search all demo receipts"
        className="w-full"
      />
      {query !== "" && (
        <div className="mt-3" role="status" aria-live="polite">
          {results.length === 0 ? (
            <p className="type-small rounded-xl border border-dashed border-line px-4 py-3 text-center text-ink-muted">
              No receipts matched your search.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {results.map((r) => (
                <li key={r.reference}>
                  <Link
                    href={`/receipt/${r.reference}`}
                    className="flex items-center gap-3 rounded-xl border border-line bg-[var(--r-card)] px-4 py-3 transition-colors hover:border-[var(--r-primary)]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold" data-mono>
                        {r.id}
                      </span>
                      <span className="type-caption block truncate text-ink-muted tnum">
                        {r.merchant} · {formatMoney({ amountMinor: r.totalMinor, currency: r.currency })} ·{" "}
                        {humanizeStatus(receiptTxState(r))} · {humanizeStatus(r.verification)}
                      </span>
                    </span>
                    <TxPill state={receiptTxState(r)} />
                    <ArrowRight className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
