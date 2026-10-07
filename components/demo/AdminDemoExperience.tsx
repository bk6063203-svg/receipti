"use client";

import * as React from "react";
import Link from "next/link";
import { BellRing, CheckCircle2, ExternalLink, Fuel, ReceiptText, Undo2 } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { listNotifyEvents, type NotifyEvent, type NotifyKind } from "@/lib/notify";
import { Badge, Button, Card, EmptyState } from "@/components/ui";

const KIND_META: Record<NotifyKind, { label: string; icon: typeof BellRing; chip: string }> = {
  sale: { label: "Sale", icon: ReceiptText, chip: "bg-[var(--r-verified-muted)] text-[var(--r-verified)]" },
  "refund-requested": { label: "Refund requested", icon: Undo2, chip: "bg-[var(--r-warning-muted)] text-[var(--r-warning)]" },
  "refund-completed": { label: "Refund approved", icon: CheckCircle2, chip: "bg-[var(--r-primary-muted)] text-[var(--r-primary)]" },
  fuel: { label: "Fuel check", icon: Fuel, chip: "bg-[var(--r-danger-muted)] text-[var(--r-danger)]" },
};

const SCENARIOS: { title: string; text: string; href: string }[] = [
  { title: "Shop as a customer", text: "Buy something — a sale event lands below.", href: "/demo/customer" },
  { title: "Ring up the till", text: "Complete a POS sale as the merchant.", href: "/demo/merchant-pos" },
  { title: "Request a refund", text: "Open any receipt and ask for a return.", href: "/customer/receipts" },
  { title: "Approve the refund", text: "The merchant approves it — watch both events.", href: "/merchant/refunds" },
  { title: "Trigger a fuel alert", text: "Run the fuel check with a mismatch.", href: "/demo/fuel" },
];

export function AdminDemoExperience() {
  const [events, setEvents] = React.useState<NotifyEvent[]>([]);

  React.useEffect(() => {
    const sync = () => setEvents(listNotifyEvents());
    sync();
    const t = window.setInterval(sync, 2000);
    window.addEventListener("receipti:notify", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.clearInterval(t);
      window.removeEventListener("receipti:notify", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="type-label flex items-center gap-1.5 text-[var(--r-primary)]">
            <BellRing className="h-3.5 w-3.5" aria-hidden="true" /> Admin · live event feed
          </p>
          <h1 className="type-h1 mt-1">Watch transactions arrive</h1>
          <p className="type-small mt-1 max-w-2xl text-ink-muted">
            Keep this tab open, run a scenario in another tab, and the notification lands
            here the moment the transaction happens — sales, refund requests, approvals, alerts.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--r-verified-muted)] px-3 py-1.5 text-xs font-bold text-[var(--r-verified)]">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
          </span>
          Live
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="flex min-h-80 flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="type-h3">Event feed</h2>
            {events.length > 0 && (
              <Badge tone="primary" className="tnum">
                {events.length} event{events.length === 1 ? "" : "s"}
              </Badge>
            )}
          </div>
          {events.length === 0 ? (
            <EmptyState
              icon={<BellRing className="h-8 w-8" aria-hidden="true" />}
              title="Listening…"
              description="Nothing has happened yet. Fire a scenario on the right and watch this feed react."
            />
          ) : (
            <ul className="flex flex-col gap-2" aria-label="Live transaction events" aria-live="polite">
              {events.slice(0, 8).map((e) => {
                const meta = KIND_META[e.kind];
                const Icon = meta.icon;
                return (
                  <li key={e.id}>
                    <Link
                      href={e.href}
                      className="flex items-center gap-3 rounded-xl border border-line px-3.5 py-3 transition-colors hover:border-[var(--r-primary)]"
                    >
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.chip}`}>
                        <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{e.title}</span>
                        <span className="type-caption mt-0.5 block truncate text-ink-muted">{e.detail}</span>
                      </span>
                      <span className="type-caption shrink-0 text-ink-faint tnum">
                        {formatDateTime(e.at)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            <Link href="/admin/notifications">
              <Button size="sm">Open notification center</Button>
            </Link>
            <Link href="/admin">
              <Button size="sm" variant="outline">Open admin portal</Button>
            </Link>
          </div>
        </Card>

        <div className="flex flex-col gap-3">
          <h2 className="type-h4">Make the feed react</h2>
          {SCENARIOS.map((s) => (
            <a
              key={s.title}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-line bg-[var(--r-card)] p-4 shadow-subtle transition-colors hover:border-[var(--r-primary)]"
            >
              <span className="flex items-center justify-between gap-2 text-sm font-bold">
                {s.title}
                <ExternalLink className="h-4 w-4 shrink-0 text-ink-faint transition-colors group-hover:text-[var(--r-primary)]" aria-hidden="true" />
              </span>
              <span className="type-small mt-0.5 block text-ink-muted">{s.text}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
