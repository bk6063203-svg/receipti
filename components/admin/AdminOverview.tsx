"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileText,
  Plug,
  ReceiptText,
  RefreshCw,
  SearchX,
  ShieldCheck,
  Store,
  Undo2,
} from "lucide-react";
import type { ReceiptTxState } from "@/types/pos";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { receiptTxState } from "@/lib/pos";
import { listStoredReceipts } from "@/lib/pos-store";
import {
  activityFeed,
  allReceipts,
  merchantStats,
  systemTotals,
  type AdminReceiptRow,
  type MerchantStat,
} from "@/lib/admin";
import {
  Badge,
  Button,
  Card,
  DataTable,
  LoadingState,
  Modal,
  PageHeader,
  SearchInput,
  Select,
  StatCard,
  VerificationStatusBadge,
  type Column,
} from "@/components/ui";
import { TxPill } from "@/components/merchant";

const KIND_ICON = {
  receipt: ReceiptText,
  refund: Undo2,
  verification: ShieldCheck,
  integration: RefreshCw,
  discrepancy: SearchX,
} as const;

export default function AdminOverview() {
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<AdminReceiptRow[]>([]);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<"ALL" | ReceiptTxState>("ALL");
  const [merchant, setMerchant] = React.useState<MerchantStat | null>(null);

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      setRows(allReceipts(listStoredReceipts()));
      setLoading(false);
    }, 400);
    return () => window.clearTimeout(t);
  }, []);

  const totals = systemTotals(rows);
  const merchants = merchantStats(rows);
  const activity = activityFeed(rows);

  const query = q.trim().toLowerCase();
  const filtered = rows.filter((r) => {
    if (status !== "ALL" && receiptTxState(r.receipt) !== status) return false;
    if (query === "") return true;
    return [r.receipt.id, r.receipt.transactionId, r.receipt.merchant, r.receipt.reference]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  const columns: Column<AdminReceiptRow>[] = [
    {
      key: "id",
      header: "Receipt ID",
      render: (r) => (
        <span className="font-semibold" data-mono>
          {r.receipt.id}
        </span>
      ),
    },
    { key: "merchant", header: "Merchant", render: (r) => <span className="whitespace-nowrap">{r.receipt.merchant}</span> },
    {
      key: "txn",
      header: "Transaction",
      render: (r) => (
        <span className="whitespace-nowrap" data-mono>
          {r.receipt.transactionId}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      numeric: true,
      render: (r) => (
        <span data-numeric>
          {formatMoney({ amountMinor: r.receipt.totalMinor, currency: r.receipt.currency })}
        </span>
      ),
    },
    { key: "status", header: "Status", render: (r) => <TxPill state={receiptTxState(r.receipt)} /> },
    {
      key: "verification",
      header: "Verification",
      render: (r) => <VerificationStatusBadge status={r.receipt.verification} />,
    },
    {
      key: "created",
      header: "Created",
      render: (r) => <span className="whitespace-nowrap tnum">{formatDate(r.receipt.issuedAt)}</span>,
    },
    { key: "source", header: "Source", render: (r) => <span className="whitespace-nowrap text-ink-muted">{r.source}</span> },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <Link href={`/receipt/${r.receipt.reference}`}>
          <Button variant="ghost" size="sm" aria-label={`View receipt ${r.receipt.id}`}>
            View
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="container-x section-y flex flex-col gap-8">
      <PageHeader
        title="System overview"
        description="Prototype-only internal view of the Receipti demo — merchants, receipts, and activity across the ecosystem."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Admin" }]}
      />

      {loading ? (
        <LoadingState variant="skeleton" lines={6} label="Loading system overview…" />
      ) : (
        <>
          <section aria-label="System totals">
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-6">
              <StatCard label="Merchants" value={String(totals.merchants)} hint="demo workspaces" icon={<Store className="h-4 w-4" aria-hidden="true" />} />
              <StatCard label="Receipts" value={String(totals.receipts)} hint="trusted records" icon={<ReceiptText className="h-4 w-4" aria-hidden="true" />} />
              <StatCard label="Transactions" value={String(totals.transactions)} hint="mirrored from POS" icon={<FileText className="h-4 w-4" aria-hidden="true" />} />
              <StatCard label="Refunds" value={String(totals.refunds)} hint="linked events" icon={<Undo2 className="h-4 w-4" aria-hidden="true" />} />
              <StatCard label="Verifications" value={String(totals.verificationEvents)} hint="request log" icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />} />
              <StatCard label="Discrepancies" value={String(totals.discrepancies)} hint="mismatch requests" icon={<SearchX className="h-4 w-4" aria-hidden="true" />} />
            </div>
          </section>

          <section aria-label="Receipt overview" className="flex flex-col gap-3">
<div className="flex items-center justify-between gap-3">
              <h2 className="type-h3">Receipts</h2>
              <Link href="/admin/receipts" className="type-small inline-flex shrink-0 items-center gap-1 font-semibold text-[var(--r-primary)]">
                View all
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <SearchInput
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onClear={() => setQ("")}
                placeholder="Search receipt, transaction, or merchant…"
                aria-label="Search all receipts"
                className="sm:max-w-sm"
              />
              <Select
                aria-label="Filter by status"
                value={status}
                onChange={(e) => setStatus(e.target.value as "ALL" | ReceiptTxState)}
                options={[
                  { value: "ALL", label: "All statuses" },
                  { value: "PAID", label: "Paid" },
                  { value: "PARTIALLY_REFUNDED", label: "Partially refunded" },
                  { value: "REFUNDED", label: "Refunded" },
                ]}
                className="sm:w-48"
              />
              <span className="flex-1" />
              <p className="type-small self-center text-ink-muted tnum" role="status" aria-live="polite">
                {filtered.length} of {rows.length} receipts
              </p>
            </div>
            <DataTable
              columns={columns}
              rows={filtered.slice(0, 6)}
              rowKey={(r) => r.receipt.reference}
              caption="System-wide demo receipts"
              emptyTitle="No receipts"
              emptyDescription="No receipts match the current search."
            />
          </section>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <section aria-label="Merchants" className="flex flex-col gap-3">
<div className="flex items-center justify-between gap-3">
              <h2 className="type-h3">Merchants</h2>
              <Link href="/admin/merchants" className="type-small inline-flex shrink-0 items-center gap-1 font-semibold text-[var(--r-primary)]">
                View all
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {merchants.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => setMerchant(m)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-line bg-[var(--r-card)] px-4 py-3.5 text-left transition-colors hover:border-[var(--r-primary)]"
                      aria-label={`View ${m.name} details`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--r-primary-muted)] text-[var(--r-primary)]">
                        <Store className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">{m.name}</span>
                        <span className="type-caption block truncate text-ink-muted tnum">
                          {m.receipts} receipt{m.receipts === 1 ? "" : "s"}
                        </span>
                      </span>
                      <span className="type-status inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--r-verified-muted)] px-2.5 py-1 text-[var(--r-verified)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--r-verified)]" aria-hidden="true" />
                        Connected
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-label="Activity feed" className="flex flex-col gap-3">
<div className="flex items-center justify-between gap-3">
              <h2 className="type-h3">Activity</h2>
              <Link href="/admin/activity" className="type-small inline-flex shrink-0 items-center gap-1 font-semibold text-[var(--r-primary)]">
                View all
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
              <Card className="max-h-[26rem] overflow-y-auto">
                <ul className="flex flex-col gap-1">
                  {activity.slice(0, 6).map((a) => {
                    const Icon = KIND_ICON[a.kind];
                    return (
                      <li key={a.id}>
                        <Link
                          href={a.href}
                          className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-background"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background text-ink-muted transition-colors group-hover:bg-[var(--r-primary-muted)] group-hover:text-[var(--r-primary)]">
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">{a.title}</span>
                            <span className="type-caption block truncate text-ink-muted">{a.detail}</span>
                          </span>
                          <span className="type-caption shrink-0 text-ink-faint tnum">{formatDate(a.at)}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </section>
          </div>

          <section aria-label="System health">
            <h2 className="type-h3">System health</h2>
            <Card className="mt-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[0.9375rem] font-bold">Receipti system</p>
                <Badge tone="neutral">Demo environment</Badge>
              </div>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {["API", "Receipt processing", "Verification", "Webhooks", "Receipt delivery"].map((s) => (
                  <li
                    key={s}
                    className="flex items-center justify-between gap-2 rounded-xl bg-background px-3.5 py-2.5"
                  >
                    <span className="type-small font-medium">{s}</span>
                    <span className="type-status inline-flex items-center gap-1 rounded-full bg-[var(--r-verified-muted)] px-2 py-0.5 text-[var(--r-verified)]">
                      <Check className="h-3 w-3" aria-hidden="true" />
                      Operational
                    </span>
                  </li>
                ))}
              </ul>
              <p className="type-caption mt-3 text-ink-faint">
                Demo health only — not a production uptime claim.
              </p>
            </Card>
          </section>
        </>
      )}

      <Modal
        open={merchant !== null}
        onClose={() => setMerchant(null)}
        title={merchant?.name ?? "Merchant"}
        description={merchant ? `${merchant.branch} · ${merchant.trade}` : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => setMerchant(null)}>
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
        {merchant && (
          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              ["Integration", merchant.posName],
              ["Receipts", String(merchant.receipts)],
              ["Last synchronization", merchant.lastSync ? formatDateTime(merchant.lastSync) : "No activity yet"],
            ].map(([term, value]) => (
              <div key={term} className="rounded-xl bg-background px-3.5 py-2.5">
                <dt className="type-caption text-ink-faint">{term}</dt>
                <dd className="type-small mt-0.5 font-semibold">{value}</dd>
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
