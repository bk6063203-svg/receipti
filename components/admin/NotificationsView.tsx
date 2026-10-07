"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, CheckCircle2, Fuel, ReceiptText, Undo2 } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import {
  listNotifyEvents,
  markNotifySeen,
  unreadNotifyCount,
  type NotifyEvent,
  type NotifyKind,
} from "@/lib/notify";
import { Badge, Button, Card, EmptyState } from "@/components/ui";

const KIND_META: Record<NotifyKind, { label: string; icon: typeof Bell; chip: string }> = {
  sale: { label: "Sale", icon: ReceiptText, chip: "bg-[var(--r-verified-muted)] text-[var(--r-verified)]" },
  "refund-requested": { label: "Refund requested", icon: Undo2, chip: "bg-[var(--r-warning-muted)] text-[var(--r-warning)]" },
  "refund-completed": { label: "Refund approved", icon: CheckCircle2, chip: "bg-[var(--r-primary-muted)] text-[var(--r-primary)]" },
  fuel: { label: "Fuel check", icon: Fuel, chip: "bg-[var(--r-danger-muted)] text-[var(--r-danger)]" },
};

export function NotificationsView() {
  const [events, setEvents] = React.useState<NotifyEvent[]>([]);
  const [fresh, setFresh] = React.useState(0);

  React.useEffect(() => {
    const sync = () => setEvents(listNotifyEvents());
    sync();
    setFresh(unreadNotifyCount());
    markNotifySeen();
    window.addEventListener("receipti:notify", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("receipti:notify", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="type-label text-[var(--r-primary)]">Admin</p>
          <h1 className="type-h1 mt-1">Notifications</h1>
          <p className="type-small mt-1 text-ink-muted">
            Every sale, refund request, approval, and fuel discrepancy lands here the moment it happens.
          </p>
        </div>
        {fresh > 0 && (
          <Badge tone="primary" className="tnum">
            {fresh} new since last visit
          </Badge>
        )}
      </div>

      {events.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Bell className="h-8 w-8" aria-hidden="true" />}
            title="Quiet so far"
            description="Run a demo transaction and it lands here instantly — try one of these."
          />
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link href="/demo/customer">
              <Button size="sm">Shop as a customer</Button>
            </Link>
            <Link href="/demo/merchant-pos">
              <Button size="sm" variant="outline">Ring up a POS sale</Button>
            </Link>
            <Link href="/customer/receipts">
              <Button size="sm" variant="outline">Request a refund</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <ul className="flex flex-col gap-2.5" aria-label="Transaction notifications">
          {events.map((e) => {
            const meta = KIND_META[e.kind];
            const Icon = meta.icon;
            return (
              <li key={e.id}>
                <Link
                  href={e.href}
                  className="flex items-center gap-3.5 rounded-2xl border border-line bg-[var(--r-card)] px-4 py-3.5 shadow-subtle transition-shadow hover:shadow-card"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.chip}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{e.title}</span>
                    <span className="type-caption mt-0.5 block truncate text-ink-muted">{e.detail}</span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <Badge>{meta.label}</Badge>
                    <span className="type-caption whitespace-nowrap text-ink-faint tnum">
                      {formatDateTime(e.at)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
