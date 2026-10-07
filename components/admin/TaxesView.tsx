"use client";

import * as React from "react";
import { Landmark } from "lucide-react";
import { listStoredReceipts } from "@/lib/pos-store";
import { allReceipts, merchantMoney, taxTotals, type MerchantMoney, type MoneyTotal } from "@/lib/admin";
import { formatMoney } from "@/lib/format";
import {
  Badge,
  Card,
  DataTable,
  LoadingState,
  PageHeader,
  StatCard,
  type Column,
} from "@/components/ui";

function moneyList(totals: MoneyTotal[]): string {
  if (totals.length === 0) return "—";
  return totals.map((t) => formatMoney({ amountMinor: t.minor, currency: t.currency })).join(" · ");
}

export default function TaxesView() {
  const [loading, setLoading] = React.useState(true);
  const [merchants, setMerchants] = React.useState<MerchantMoney[]>([]);
  const [totals, setTotals] = React.useState<MoneyTotal[]>([]);

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      const rows = allReceipts(listStoredReceipts());
      setMerchants(merchantMoney(rows));
      setTotals(taxTotals(rows));
      setLoading(false);
    }, 350);
    return () => window.clearTimeout(t);
  }, []);

  const columns: Column<MerchantMoney>[] = [
    {
      key: "name",
      header: "Merchant",
      render: (m) => <span className="font-semibold">{m.name}</span>,
    },
    { key: "trade", header: "Trade", render: (m) => m.trade },
    {
      key: "receipts",
      header: "Receipts",
      align: "right",
      numeric: true,
      render: (m) => <span data-numeric>{m.receipts}</span>,
    },
    {
      key: "revenue",
      header: "Revenue recorded",
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
      key: "reporting",
      header: "Reporting",
      render: (m) =>
        m.receipts > 0 ? (
          <Badge tone="success" dot>
            Reporting
          </Badge>
        ) : (
          <Badge tone="neutral">No receipts</Badge>
        ),
    },
  ];

  return (
    <div className="container-x section-y flex flex-col gap-6">
      <PageHeader
        title="Tax overview"
        description="Tax reported on receipt records, per merchant — the figures an authorized reviewer would inspect."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Taxes" },
        ]}
      />

      {loading ? (
        <LoadingState variant="skeleton" lines={6} label="Loading tax overview…" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {totals.map((t) => (
              <StatCard
                key={t.currency}
                label={`Tax reported (${t.currency})`}
                value={formatMoney({ amountMinor: t.minor, currency: t.currency })}
                hint="sum of receipt tax lines"
                icon={<Landmark className="h-4 w-4" aria-hidden="true" />}
              />
            ))}
            <StatCard
              label="Merchants reporting"
              value={String(merchants.filter((m) => m.receipts > 0).length)}
              hint={`of ${merchants.length} on record`}
            />
          </div>
          <DataTable
            columns={columns}
            rows={merchants}
            rowKey={(m) => m.id}
            caption="Tax reported per merchant (demo data)"
            emptyTitle="No merchants"
            emptyDescription="No merchant records found."
          />
          <Card>
            <p className="type-small text-ink-muted">
              Demo figures computed from receipt records — not filings, not assessments.
              “Reporting” only means the merchant has receipts on record; it says nothing
              about real-world compliance.
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
