"use client";

import * as React from "react";
import Link from "next/link";
import { listStoredReceipts } from "@/lib/pos-store";
import { getSavedRefs, setReceiptSaved } from "@/lib/wallet-store";
import { allReceipts, type AdminReceiptRow } from "@/lib/admin";
import { Button, EmptyState, LoadingState, PageHeader, SearchInput } from "@/components/ui";
import { ReceiptRow } from "./ReceiptRow";
import { cn } from "@/lib/utils";

export default function ReceiptsView() {
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<AdminReceiptRow[]>([]);
  const [saved, setSaved] = React.useState<string[]>([]);
  const [q, setQ] = React.useState("");
  const [merchant, setMerchant] = React.useState<string>("ALL");

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      setRows(allReceipts(listStoredReceipts()));
      setSaved(getSavedRefs());
      setLoading(false);
    }, 350);
    return () => window.clearTimeout(t);
  }, []);

  const toggleSave = (reference: string) => {
    setSaved((prev) => [...setReceiptSaved(reference, !prev.includes(reference))]);
  };

  const query = q.trim().toLowerCase();
  const merchants = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) counts.set(r.receipt.merchant, (counts.get(r.receipt.merchant) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);

  const filtered = rows.filter((r) => {
    if (merchant !== "ALL" && r.receipt.merchant !== merchant) return false;
    if (query === "") return true;
    return [r.receipt.id, r.receipt.transactionId, r.receipt.merchant, r.receipt.reference]
      .concat(r.receipt.lines.map((l) => `${l.name} ${l.sku}`))
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  return (
    <div className="container-x section-y flex flex-col gap-6">
      <PageHeader
        title="My receipts"
        description="Every receipt issued to you — search, filter, save to wallet."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Customer", href: "/customer" },
          { label: "Receipts" },
        ]}
      />

      {loading ? (
        <LoadingState variant="skeleton" lines={6} label="Loading receipts…" />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <SearchInput
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onClear={() => setQ("")}
              placeholder="Search merchant, receipt, transaction, or product…"
              aria-label="Search receipts"
              className="sm:max-w-md"
            />
            {merchants.length > 1 && (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by merchant">
                <FilterChip active={merchant === "ALL"} onClick={() => setMerchant("ALL")}>
                  All merchants
                </FilterChip>
                {merchants.map(([name, count]) => (
                  <FilterChip key={name} active={merchant === name} onClick={() => setMerchant(name)}>
                    {name} · {count}
                  </FilterChip>
                ))}
              </div>
            )}
          </div>
          {filtered.length === 0 ? (
            <EmptyState
              title="No receipts found"
              description="Try a different search, or run a sale in the Merchant POS demo to create one."
              action={
                <Link href="/demo/merchant-pos">
                  <Button variant="outline">Open Merchant POS</Button>
                </Link>
              }
            />
          ) : (
            <>
              <p className="type-small text-ink-muted tnum" role="status" aria-live="polite">
                {filtered.length} of {rows.length} receipts
              </p>
              <ul className="flex flex-col gap-2" aria-label="Customer receipts">
                {filtered.map((r) => (
                  <li key={r.receipt.reference}>
                    <ReceiptRow
                      receipt={r.receipt}
                      saved={saved.includes(r.receipt.reference)}
                      onToggleSave={toggleSave}
                    />
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "type-small rounded-full border px-3.5 py-1.5 font-semibold transition-colors",
        active
          ? "border-[var(--r-primary)] bg-[var(--r-primary)] text-white"
          : "border-line bg-[var(--r-card)] text-ink-muted hover:border-[var(--r-primary)] hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}
