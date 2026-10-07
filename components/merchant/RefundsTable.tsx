"use client";

import Link from "next/link";
import { formatDate, formatMoney } from "@/lib/format";
import { aed } from "@/lib/pos";
import { customerLabel, type RefundRow } from "@/lib/merchant";
import { RefundStatusPill } from "@/components/refunds";
import { Button, DataTable, type Column } from "@/components/ui";

export function RefundsTable({
  rows,
  loading,
  onApprove,
}: {
  rows: RefundRow[];
  loading: boolean;
  onApprove?: (row: RefundRow) => void;
}) {
  const columns: Column<RefundRow>[] = [
    {
      key: "id",
      header: "Refund ID",
      render: ({ refund }) => (
        <span className="whitespace-nowrap font-semibold" data-mono>{refund.id}</span>
      ),
    },
    {
      key: "receipt",
      header: "Receipt",
      render: ({ receipt }) => (
        <span className="whitespace-nowrap" data-mono>{receipt.id}</span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: ({ receipt }) => <span className="whitespace-nowrap">{customerLabel(receipt)}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      numeric: true,
      render: ({ refund }) => <span data-numeric>{formatMoney(aed(refund.amountMinor))}</span>,
    },
    {
      key: "reason",
      header: "Reason",
      render: ({ refund }) => (
        <span className="block max-w-56 truncate">{refund.reason ?? refund.label ?? "—"}</span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: ({ refund }) => <span className="whitespace-nowrap tnum">{formatDate(refund.createdAt)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: ({ refund }) => <RefundStatusPill status={refund.status ?? "COMPLETED"} />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (row) => (
        <span className="inline-flex items-center justify-end gap-2">
          {row.refund.status === "PENDING" && onApprove && (
            <Button size="sm" onClick={() => onApprove!(row)} aria-label={`Approve refund ${row.refund.id}`}>
              Approve
            </Button>
          )}
          <Link href={`/receipt/${row.receipt.reference}#refunds`}>
            <Button variant="ghost" size="sm" aria-label={`Open receipt ${row.receipt.id} refunds`}>
              Open receipt
            </Button>
          </Link>
        </span>
      ),
    },
  ];
  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={({ refund, receipt }) => `${receipt.reference}-${refund.id}`}
      loading={loading}
      caption="Refund events linked to this merchant's receipts"
      emptyTitle="No refunds"
      emptyDescription="No refunds in this workspace yet."
    />
  );
}
