"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Plug, Store } from "lucide-react";
import { listStoredReceipts } from "@/lib/pos-store";
import { allReceipts, merchantMoney, type MerchantMoney, type MoneyTotal } from "@/lib/admin";
import { formatMoney } from "@/lib/format";
import {
  Button,
  DataTable,
  LoadingState,
  Modal,
  PageHeader,
  type Column,
} from "@/components/ui";

function moneyList(totals: MoneyTotal[]): string {
  if (totals.length === 0) return "—";
  return totals.map((t) => formatMoney({ amountMinor: t.minor, currency: t.currency })).join(" · ");
}

export default function MerchantsView() {
  const [loading, setLoading] = React.useState(true);
  const [merchants, setMerchants] = React.useState<MerchantMoney[]>([]);
  const [selected, setSelected] = React.useState<MerchantMoney | null>(null);

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      setMerchants(merchantMoney(allReceipts(listStoredReceipts())));
      setLoading(false);
    }, 350);
    return () => window.clearTimeout(t);
  }, []);

  const columns: Column<MerchantMoney>[] = [
    {
      key: "name",
      header: "Merchant",
      render: (m) => (
        <span className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--r-primary-muted)] text-[var(--r-primary)]">
            <Store className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="font-semibold">{m.name}</span>
        </span>
      ),
    },
    { key: "trade", header: "Trade", render: (m) => m.trade },
    { key: "pos", header: "Integration", render: (m) => <span className="whitespace-nowrap">{m.posName}</span> },
    {
      key: "receipts",
      header: "Receipts",
      align: "right",
      numeric: true,
      render: (m) => <span data-numeric>{m.receipts}</span>,
    },
    {
      key: "revenue",
      header: "Revenue",
      align: "right",
      render: (m) => <span className="whitespace-nowrap tnum" data-numeric>{moneyList(m.revenue)}</span>,
    },
    {
      key: "tax",
      header: "Tax reported",
      align: "right",
      render: (m) => <span className="whitespace-nowrap tnum" data-numeric>{moneyList(m.tax)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: () => (
        <span className="type-status inline-flex items-center gap-1.5 rounded-full bg-[var(--r-verified-muted)] px-2.5 py-1 text-[var(--r-verified)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--r-verified)]" aria-hidden="true" />
          Connected
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (m) => (
        <Button variant="ghost" size="sm" onClick={() => setSelected(m)} aria-label={`View ${m.name} details`}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="container-x section-y flex flex-col gap-6">
      <PageHeader
        title="Merchants"
        description="Every business on Receipti — receipts issued, revenue recorded, tax reported."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Merchants" },
        ]}
      />

      {loading ? (
        <LoadingState variant="skeleton" lines={6} label="Loading merchants…" />
      ) : (
        <>
          <p className="type-small text-ink-muted tnum" role="status">
            {merchants.length} merchants · {merchants.reduce((n, m) => n + m.receipts, 0)} receipts on record
          </p>
          <DataTable
            columns={columns}
            rows={merchants}
            rowKey={(m) => m.id}
            caption="Merchants using Receipti (demo data)"
            emptyTitle="No merchants"
            emptyDescription="No merchant records found."
          />
        </>
      )}

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.name ?? "Merchant"}
        description={selected ? `${selected.trade} · ${selected.posName}` : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Close
            </Button>
            <Link href="/merchant">
              <Button rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
                Open dashboard
              </Button>
            </Link>
          </>
        }
      >
        {selected && (
          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              ["Receipts issued", String(selected.receipts)],
              ["Revenue recorded", moneyList(selected.revenue)],
              ["Tax reported", moneyList(selected.tax)],
            ].map(([term, value]) => (
              <div key={term} className="rounded-xl bg-background px-3.5 py-2.5">
                <dt className="type-caption text-ink-faint">{term}</dt>
                <dd className="type-small mt-0.5 font-semibold tnum">{value}</dd>
              </div>
            ))}
            <div className="rounded-xl bg-background px-3.5 py-2.5">
              <dt className="type-caption text-ink-faint">Status</dt>
              <dd className="mt-1">
                <span className="type-status inline-flex items-center gap-1.5 rounded-full bg-[var(--r-verified-muted)] px-2.5 py-1 text-[var(--r-verified)]">
                  <Plug className="h-3.5 w-3.5" aria-hidden="true" />
                  Connected (demo)
                </span>
              </dd>
            </div>
          </dl>
        )}
      </Modal>
    </div>
  );
}
