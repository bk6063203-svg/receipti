"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Undo2 } from "lucide-react";
import { receiptTxState } from "@/lib/pos";
import { listStoredReceipts } from "@/lib/pos-store";
import { allReceipts, type AdminReceiptRow } from "@/lib/admin";
import { Card, LoadingState, PageHeader, StatCard } from "@/components/ui";
import { TxPill } from "@/components/merchant";

export default function RefundsView() {
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<AdminReceiptRow[]>([]);

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      setRows(allReceipts(listStoredReceipts()));
      setLoading(false);
    }, 350);
    return () => window.clearTimeout(t);
  }, []);

  const refunded = rows.filter((r) => receiptTxState(r.receipt) !== "PAID");
  const partial = refunded.filter((r) => receiptTxState(r.receipt) === "PARTIALLY_REFUNDED").length;
  const full = refunded.length - partial;

  return (
    <div className="container-x section-y flex flex-col gap-6">
      <PageHeader
        title="Refunds"
        description="Returns and corrections on your receipts — requested at the merchant, tracked here."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Customer", href: "/customer" },
          { label: "Refunds" },
        ]}
      />

      {loading ? (
        <LoadingState variant="skeleton" lines={5} label="Loading refunds…" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Receipts with refunds" value={String(refunded.length)} hint="linked to records" />
            <StatCard label="Partial" value={String(partial)} hint="corrected line items" />
            <StatCard label="Full" value={String(full)} hint="whole receipt returned" />
          </div>
          {refunded.length === 0 ? (
            <Card>
              <p className="type-small text-ink-muted">
                No refunds on your receipts. Returns requested on any receipt appear here
                with their status.
              </p>
            </Card>
          ) : (
            <ul className="flex flex-col gap-2" aria-label="Refunded receipts">
              {refunded.map((r) => (
                <li key={r.receipt.reference}>
                  <Link
                    href={`/receipt/${r.receipt.reference}#refunds`}
                    className="flex items-center gap-3 rounded-2xl border border-line bg-[var(--r-card)] px-4 py-3 transition-colors hover:border-[var(--r-primary)]"
                    aria-label={`Refund history for receipt ${r.receipt.id}`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--r-primary-muted)] text-[var(--r-primary)]">
                      <Undo2 className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">
                        {r.receipt.merchant} · <span data-mono>{r.receipt.id}</span>
                      </span>
                      <span className="type-caption block truncate text-ink-muted">
                        {r.receipt.refunds?.length ?? 0} refund event{(r.receipt.refunds?.length ?? 0) === 1 ? "" : "s"}
                      </span>
                    </span>
                    <TxPill state={receiptTxState(r.receipt)} />
                    <ArrowRight className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
