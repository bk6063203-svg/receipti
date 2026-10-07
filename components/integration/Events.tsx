"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, CircleDashed, Clock, Webhook } from "lucide-react";
import type { DeliveryStatus, SyncLogEntry, WebhookEvent } from "@/types/integration";
import { formatDateTime } from "@/lib/format";
import { Button, DataTable, Modal, type Column } from "@/components/ui";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./Api";

/* ---------------- sub-navigation ---------------- */

const TABS = [
  { href: "/merchant/integration", label: "Overview" },
  { href: "/merchant/integration/webhooks", label: "Webhooks" },
  { href: "/merchant/integration/logs", label: "Logs" },
];

export function IntegrationTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Integration sections" className="flex gap-1 rounded-xl border border-line bg-[var(--r-card)] p-1">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
              active ? "bg-[var(--r-primary-muted)] text-[var(--r-primary)]" : "text-ink-muted hover:text-ink"
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

/* ---------------- delivery pill ---------------- */

const DELIVERY_META = {
  SUCCESS: { label: "Success", icon: Check, cls: "bg-[var(--r-verified-muted)] text-[var(--r-verified)]" },
  PENDING: { label: "Pending", icon: Clock, cls: "bg-[var(--r-warning-muted)] text-[var(--r-warning)]" },
  FAILED: { label: "Failed", icon: CircleDashed, cls: "bg-[var(--r-danger-muted)] text-[var(--r-danger)]" },
} as const;

export function DeliveryPill({ status }: { status: DeliveryStatus }) {
  const meta = DELIVERY_META[status];
  const Icon = meta.icon;
  return (
    <span className={cn("type-status inline-flex items-center gap-1.5 rounded-full px-2.5 py-1", meta.cls)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

/* ---------------- webhooks ---------------- */

export function WebhooksTable({
  events,
  loading,
  onView,
}: {
  events: WebhookEvent[];
  loading: boolean;
  onView: (e: WebhookEvent) => void;
}) {
  const columns: Column<WebhookEvent>[] = [
    {
      key: "event",
      header: "Event",
      render: (e) => (
        <span className="whitespace-nowrap font-mono text-[0.8125rem] font-semibold">{e.type}</span>
      ),
    },
    { key: "status", header: "Status", render: (e) => <DeliveryPill status={e.status} /> },
    {
      key: "timestamp",
      header: "Timestamp",
      render: (e) => <span className="whitespace-nowrap tnum">{formatDateTime(e.timestamp)}</span>,
    },
    {
      key: "receipt",
      header: "Receipt ID",
      render: (e) => (
        <span className="whitespace-nowrap" data-mono>{e.receiptId}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (e) => (
        <Button variant="ghost" size="sm" onClick={() => onView(e)} aria-label={`View ${e.type} for ${e.receiptId}`}>
          View
        </Button>
      ),
    },
  ];
  return (
    <DataTable
      columns={columns}
      rows={events}
      rowKey={(e) => e.id}
      loading={loading}
      caption="Demo webhook deliveries for this merchant"
      emptyTitle="No webhook events"
      emptyDescription="No webhook deliveries recorded in this demo workspace."
    />
  );
}

export function WebhookDetailDialog({ event, onClose }: { event: WebhookEvent | null; onClose: () => void }) {
  return (
    <Modal
      open={event !== null}
      onClose={onClose}
      title={event ? event.type : "Webhook event"}
      description={event ? `Delivery to the demo merchant endpoint` : undefined}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {event && (
            <Link href={`/receipt/${event.reference}`}>
              <Button leftIcon={<Webhook className="h-4 w-4" aria-hidden="true" />}>
                View receipt
              </Button>
            </Link>
          )}
        </>
      }
    >
      {event && (
        <div className="flex flex-col gap-4">
          <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              ["Receipt ID", event.receiptId],
              ["Attempts", String(event.attempts)],
              ["Timestamp", formatDateTime(event.timestamp)],
            ].map(([term, value]) => (
              <div key={term} className="rounded-xl bg-background px-3.5 py-2.5">
                <dt className="type-caption text-ink-faint">{term}</dt>
                <dd className="type-small mt-0.5 truncate font-semibold">{value}</dd>
              </div>
            ))}
            <div className="rounded-xl bg-background px-3.5 py-2.5">
              <dt className="type-caption text-ink-faint">Delivery status</dt>
              <dd className="mt-1">
                <DeliveryPill status={event.status} />
              </dd>
            </div>
          </dl>
          {event.note && (
            <p className="type-small rounded-xl bg-background px-3.5 py-2.5 text-ink-muted">{event.note}</p>
          )}
          <div>
            <h3 className="type-label mb-2 text-ink-faint">Payload preview</h3>
            <CodeBlock code={JSON.stringify(event.payload, null, 2)} label={`${event.type} payload`} />
          </div>
          <p className="type-caption text-ink-faint">
            Demo payload — signatures and secrets never appear here.
          </p>
        </div>
      )}
    </Modal>
  );
}

/* ---------------- sync logs ---------------- */

export function LogsTable({ entries, loading }: { entries: SyncLogEntry[]; loading: boolean }) {
  const columns: Column<SyncLogEntry>[] = [
    {
      key: "timestamp",
      header: "Timestamp",
      render: (e) => <span className="whitespace-nowrap tnum">{formatDateTime(e.timestamp)}</span>,
    },
    { key: "event", header: "Event", render: (e) => <span className="whitespace-nowrap font-medium">{e.event}</span> },
    {
      key: "record",
      header: "Receipt",
      render: (e) => (
        <span className="whitespace-nowrap" data-mono>{e.record}</span>
      ),
    },
    { key: "status", header: "Status", render: (e) => <DeliveryPill status={e.status} /> },
    {
      key: "source",
      header: "Source",
      render: (e) => (
        <span className="type-status inline-flex items-center rounded-full bg-[var(--r-neutral-muted)] px-2.5 py-1 text-ink-muted">
          {e.source}
        </span>
      ),
    },
  ];
  return (
    <DataTable
      columns={columns}
      rows={entries}
      rowKey={(e) => e.id}
      loading={loading}
      caption="Demo synchronization log for this merchant"
      emptyTitle="No log entries"
      emptyDescription="No sync activity matches the selected filter."
    />
  );
}
