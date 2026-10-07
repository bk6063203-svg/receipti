"use client";

import * as React from "react";
import Link from "next/link";
import type { ReceiptTxState } from "@/types/pos";
import { receiptTxState } from "@/lib/pos";
import { listStoredReceipts } from "@/lib/pos-store";
import { allReceipts, type AdminReceiptRow } from "@/lib/admin";
import { formatDate, formatMoney } from "@/lib/format";
import {
  Button,
  DataTable,
  LoadingState,
  PageHeader,
  SearchInput,
  Select,
  VerificationStatusBadge,
  type Column,
} from "@/components/ui";
import { TxPill } from "@/components/merchant";

export default function AdminReceiptsView() {
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<AdminReceiptRow[]>([]);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<"ALL" | ReceiptTxState>("ALL");

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      setRows(allReceipts(listStoredReceipts()));
      setLoading(false);
    }, 350);
    return () => window.clearTimeout(t);
  }, []);

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
    {
      key: "tax",
      header: "Tax",
      align: "right",
      numeric: true,
      render: (r) => (
        <span data-numeric>
          {formatMoney({ amountMinor: r.receipt.taxMinor ?? 0, currency: r.receipt.currency })}
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
    <div className="container-x section-y flex flex-col gap-6">
      <PageHeader
        title="Receipt database"
        description="Every trusted record in the system — search, filter, and open any receipt."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Receipts" },
        ]}
      />

      {loading ? (
        <LoadingState variant="skeleton" lines={6} label="Loading receipts…" />
      ) : (
        <>
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
            rows={filtered}
            rowKey={(r) => r.receipt.reference}
            caption="System-wide demo receipts"
            emptyTitle="No receipts"
            emptyDescription="No receipts match the current search."
          />
        </>
      )}
    </div>
  );
}
