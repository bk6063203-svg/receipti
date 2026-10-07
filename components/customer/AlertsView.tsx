"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CircleCheck, TriangleAlert } from "lucide-react";
import { listStoredReceipts } from "@/lib/pos-store";
import { allReceipts } from "@/lib/admin";
import { allCustomerAlerts, type CustomerAlert } from "@/lib/customer";
import { formatDate } from "@/lib/format";
import { Button, Card, LoadingState, PageHeader } from "@/components/ui";

export default function AlertsView() {
  const [loading, setLoading] = React.useState(true);
  const [alerts, setAlerts] = React.useState<CustomerAlert[]>([]);
  const [checked, setChecked] = React.useState(0);

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      const rows = allReceipts(listStoredReceipts());
      setChecked(rows.length);
      setAlerts(allCustomerAlerts(rows.map((r) => r.receipt)));
      setLoading(false);
    }, 350);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="container-x section-y flex flex-col gap-6">
      <PageHeader
        title="Spending alerts"
        description="Receipts where the numbers don't add up — overcharges, mismatched totals, and failed fuel checks."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Customer", href: "/customer" },
          { label: "Alerts" },
        ]}
      />

      {loading ? (
        <LoadingState variant="skeleton" lines={5} label="Checking receipts…" />
      ) : alerts.length === 0 ? (
        <Card className="flex items-start gap-3">
          <CircleCheck className="h-8 w-8 shrink-0 text-[var(--r-verified)]" aria-hidden="true" />
          <div>
            <h2 className="type-h4">All clear — {checked} receipts checked</h2>
            <p className="type-small mt-1 text-ink-muted">
              Every receipt total matches its items. Alerts appear here automatically if a
              merchant charges more than the items add up to, or a fuel check disagrees
              with the record.
            </p>
            <div className="mt-3">
              <Link href="/demo/fuel">
                <Button variant="outline" size="sm">
                  Try the fuel check demo
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <p className="type-small text-ink-muted tnum" role="status" aria-live="polite">
            {alerts.length} alert{alerts.length === 1 ? "" : "s"} across {checked} receipts
          </p>
          <ul className="flex flex-col gap-3" aria-label="Spending alerts">
            {alerts.map((a) => (
              <li key={a.id}>
                <Link
                  href={a.href}
                  className="flex items-start gap-3 rounded-2xl border border-[var(--r-warning)]/40 bg-[var(--r-card)] p-4 transition-colors hover:border-[var(--r-warning)]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--r-warning-muted)] text-[var(--r-warning)]">
                    <TriangleAlert className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.9375rem] font-bold">{a.title}</span>
                    <span className="type-small mt-0.5 block text-ink-muted">{a.detail}</span>
                    <span className="type-caption mt-1.5 block text-ink-faint tnum">
                      {a.merchant} · {formatDate(a.at)}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 self-center text-ink-faint" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <Card>
            <p className="type-small text-ink-muted">
              These checks compare the numbers on the receipt itself — items against
              totals. They describe what the record shows; only the merchant can explain
              or correct a charge.
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
