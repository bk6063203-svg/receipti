"use client";

import Link from "next/link";
import type { VerificationEvent } from "@/types/merchant";
import { formatDateTime } from "@/lib/format";
import { Button, DataTable, type Column } from "@/components/ui";
import { VerifyResultPill } from "./Pills";

function eventHref(e: VerificationEvent): string {
  // Mismatches open the trusted receipt record; lookups open the verify flow.
  if (e.result === "MISMATCH" && e.receiptId) {
    return `/receipt/${e.reference}`;
  }
  return `/verify/${e.reference}`;
}

export function VerificationTable({ events, loading }: { events: VerificationEvent[]; loading: boolean }) {
  const columns: Column<VerificationEvent>[] = [
    {
      key: "reference",
      header: "Reference",
      render: (e) => (
        <span className="whitespace-nowrap font-semibold" data-mono>{e.reference}</span>
      ),
    },
    {
      key: "receipt",
      header: "Receipt",
      render: (e) => (
        <span className="whitespace-nowrap" data-mono>{e.receiptId ?? "—"}</span>
      ),
    },
    {
      key: "requested",
      header: "Requested at",
      render: (e) => <span className="whitespace-nowrap tnum">{formatDateTime(e.requestedAt)}</span>,
    },
    { key: "result", header: "Result", render: (e) => <VerifyResultPill result={e.result} /> },
    {
      key: "note",
      header: "Detail",
      render: (e) => (
        <span className="block max-w-64 truncate text-ink-muted">{e.note ?? "—"}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (e) => (
        <Link href={eventHref(e)}>
          <Button variant="ghost" size="sm" aria-label={`Open ${e.reference}`}>
            Open
          </Button>
        </Link>
      ),
    },
  ];
  return (
    <DataTable
      columns={columns}
      rows={events}
      rowKey={(e) => e.id}
      loading={loading}
      caption="Verification requests for this merchant's receipts"
      emptyTitle="No verification events"
      emptyDescription="No verification requests recorded yet."
    />
  );
}
