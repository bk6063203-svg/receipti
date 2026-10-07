"use client";

import type { PosReceipt } from "@/types/pos";
import { formatDate, formatMoney, formatTime } from "@/lib/format";
import { aed, PAYMENT_METHOD_LABEL } from "@/lib/pos";
import { customerLabel, deliveryFor, itemCount, txState } from "@/lib/merchant";
import { Button, DataTable, type Column } from "@/components/ui";
import { DeliveryPill, TxPill } from "./Pills";

export function ReceiptsTable({
  rows,
  loading,
  onView,
}: {
  rows: PosReceipt[];
  loading: boolean;
  onView: (receipt: PosReceipt) => void;
}) {
  const columns: Column<PosReceipt>[] = [
    {
      key: "id",
      header: "Receipt ID",
      render: (r) => (
        <span>
          <span className="block font-semibold" data-mono>{r.id}</span>
          <span className="type-caption block text-ink-faint" data-mono>{r.reference}</span>
        </span>
      ),
    },
    {
      key: "txn",
      header: "Transaction ID",
      render: (r) => (
        <span className="whitespace-nowrap" data-mono>{r.transactionId}</span>
      ),
    },
    { key: "customer", header: "Customer", render: (r) => <span className="whitespace-nowrap">{customerLabel(r)}</span> },
    {
      key: "items",
      header: "Items",
      align: "right",
      numeric: true,
      render: (r) => `${itemCount(r)}`,
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      numeric: true,
      render: (r) => <span data-numeric>{formatMoney(aed(r.totalMinor))}</span>,
    },
    { key: "payment", header: "Payment", render: (r) => PAYMENT_METHOD_LABEL[r.paymentMethod] },
    { key: "status", header: "Status", render: (r) => <TxPill state={txState(r)} /> },
    { key: "delivery", header: "Delivery", render: (r) => <DeliveryPill delivery={deliveryFor(r.reference)} /> },
    {
      key: "date",
      header: "Date",
      render: (r) => (
        <span className="whitespace-nowrap tnum">
          {formatDate(r.issuedAt)}{" "}
          <span className="text-ink-faint">{formatTime(r.issuedAt)}</span>
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <Button variant="ghost" size="sm" onClick={() => onView(r)} aria-label={`View transaction ${r.id}`}>
          View
        </Button>
      ),
    },
  ];
  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(r) => r.reference}
      loading={loading}
      caption="Digital receipts issued by this merchant"
      emptyTitle="No transactions"
      emptyDescription="No transactions match the selected filters."
    />
  );
}
