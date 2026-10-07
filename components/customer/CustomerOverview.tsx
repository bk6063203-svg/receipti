"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CircleCheck, ReceiptText, ShoppingBag, TriangleAlert, Wallet } from "lucide-react";
import { receiptTxState } from "@/lib/pos";
import { listStoredReceipts } from "@/lib/pos-store";
import { getSavedRefs, setReceiptSaved } from "@/lib/wallet-store";
import { allReceipts, type AdminReceiptRow } from "@/lib/admin";
import { allCustomerAlerts, formatTotals, totalsByCurrency } from "@/lib/customer";
import { Button, Card, LoadingState, PageHeader, StatCard } from "@/components/ui";
import { ReceiptRow } from "./ReceiptRow";

export default function CustomerOverview() {
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<AdminReceiptRow[]>([]);
  const [saved, setSaved] = React.useState<string[]>([]);

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

  const receipts = rows.map((r) => r.receipt);
  const spent = totalsByCurrency(receipts.map((r) => ({ currency: r.currency, minor: r.totalMinor })));
  const items = receipts.reduce((n, r) => n + r.lines.reduce((m, l) => m + l.quantity, 0), 0);
  const alerts = allCustomerAlerts(receipts);
  const recent = [...rows].sort((a, b) => b.receipt.issuedAt.localeCompare(a.receipt.issuedAt)).slice(0, 5);
  const savedRows = rows.filter((r) => saved.includes(r.receipt.reference));
  const refundedCount = rows.filter((r) => receiptTxState(r.receipt) !== "PAID").length;

  return (
    <div className="container-x section-y flex flex-col gap-8">
      <PageHeader
        title="Customer portal"
        description="Your spending, receipts, wallet, and alerts — in one place."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Customer" }]}
      />

      {loading ? (
        <LoadingState variant="skeleton" lines={6} label="Loading customer portal…" />
      ) : (
        <>
          <section aria-label="Spending summary">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                label="Total spent"
                value={formatTotals(spent)}
                hint="across all receipts"
                icon={<ShoppingBag className="h-4 w-4" aria-hidden="true" />}
              />
              <StatCard
                label="Items bought"
                value={String(items)}
                hint="units on record"
                icon={<ReceiptText className="h-4 w-4" aria-hidden="true" />}
              />
              <StatCard
                label="Receipts"
                value={String(rows.length)}
                hint={`${saved.length} saved · ${refundedCount} with refunds`}
                icon={<Wallet className="h-4 w-4" aria-hidden="true" />}
              />
            </div>
          </section>

          {alerts.length > 0 ? (
            <Card
              as="section"
              aria-label="Spending alerts"
              className="border-[var(--r-warning)]/40 bg-[var(--r-warning-muted)]"
            >
              <div className="flex items-start gap-3">
                <TriangleAlert className="h-6 w-6 shrink-0 text-[var(--r-warning)]" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <h2 className="type-h4">
                    {alerts.length} spending alert{alerts.length === 1 ? "" : "s"}
                  </h2>
                  <p className="type-small mt-0.5 text-ink-muted">{alerts[0]!.title} — {alerts[0]!.merchant}</p>
                  <Link
                    href="/customer/alerts"
                    className="type-small mt-2 inline-flex items-center gap-1 font-semibold text-[var(--r-primary)]"
                  >
                    Review alerts
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            <Card as="section" aria-label="Spending alerts" className="flex items-start gap-3">
              <CircleCheck className="h-6 w-6 shrink-0 text-[var(--r-verified)]" aria-hidden="true" />
              <div>
                <h2 className="type-h4">No alerts — everything adds up</h2>
                <p className="type-small mt-0.5 text-ink-muted">
                  Every receipt total was checked against its items.
                </p>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <section aria-label="Recent receipts" className="flex min-w-0 flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="type-h3">Recent receipts</h2>
                <Link href="/customer/receipts" className="type-small inline-flex shrink-0 items-center gap-1 font-semibold text-[var(--r-primary)]">
                  View all
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
              <ul className="flex flex-col gap-2">
                {recent.map((r) => (
                  <li key={r.receipt.reference}>
                    <ReceiptRow
                      receipt={r.receipt}
                      saved={saved.includes(r.receipt.reference)}
                      onToggleSave={toggleSave}
                    />
                  </li>
                ))}
              </ul>
            </section>

            <section aria-label="Wallet preview" className="flex min-w-0 flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="type-h3">Wallet</h2>
                <Link href="/customer/wallet" className="type-small inline-flex shrink-0 items-center gap-1 font-semibold text-[var(--r-primary)]">
                  Open wallet
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
              {savedRows.length === 0 ? (
                <Card>
                  <p className="type-small text-ink-muted">
                    Nothing saved yet — tap the bookmark on any receipt to keep it here.
                  </p>
                  <div className="mt-3">
                    <Link href="/customer/receipts">
                      <Button variant="outline" size="sm">
                        Browse receipts
                      </Button>
                    </Link>
                  </div>
                </Card>
              ) : (
                <ul className="flex flex-col gap-2">
                  {savedRows.slice(0, 3).map((r) => (
                    <li key={r.receipt.reference}>
                      <ReceiptRow receipt={r.receipt} saved onToggleSave={toggleSave} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
