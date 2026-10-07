"use client";

import type { PosReceipt } from "@/types/pos";
import { formatDate, formatMoney, formatTime } from "@/lib/format";
import { aed, PAYMENT_METHOD_LABEL, refundedMinorTotal } from "@/lib/pos";
import { customerLabel, netMinor, txState } from "@/lib/merchant";
import { Button, DataTable, type Column } from "@/components/ui";
import { TxPill } from "./Pills";

/** Payment lens on the same records: gross, refunded, net per transaction. */
export function TransactionsTable({
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
      key: "txn",
      header: "Transaction ID",
      render: (r) => (
        <span className="whitespace-nowrap font-semibold" data-mono>{r.transactionId}</span>
      ),
    },
    {
      key: "receipt",
      header: "Receipt",
      render: (r) => (
        <span className="whitespace-nowrap" data-mono>{r.id}</span>
      ),
    },
    { key: "customer", header: "Customer", render: (r) => <span className="whitespace-nowrap">{customerLabel(r)}</span> },
    {
      key: "gross",
      header: "Gross",
      align: "right",
      numeric: true,
      render: (r) => <span data-numeric>{formatMoney(aed(r.totalMinor))}</span>,
    },
    {
      key: "refunded",
      header: "Refunded",
      align: "right",
      numeric: true,
      render: (r) => <span data-numeric>{formatMoney(aed(refundedMinorTotal(r)))}</span>,
    },
    {
      key: "net",
      header: "Net",
      align: "right",
      numeric: true,
      render: (r) => (
        <span className="font-semibold" data-numeric>{formatMoney(aed(netMinor(r)))}</span>
      ),
    },
    { key: "payment", header: "Payment", render: (r) => PAYMENT_METHOD_LABEL[r.paymentMethod] },
    { key: "status", header: "Status", render: (r) => <TxPill state={txState(r)} /> },
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
        <Button variant="ghost" size="sm" onClick={() => onView(r)} aria-label={`View transaction ${r.transactionId}`}>
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
      caption="Payment transactions mirrored from the merchant system"
      emptyTitle="No transactions"
      emptyDescription="No transactions match the selected filters."
    />
  );
}
