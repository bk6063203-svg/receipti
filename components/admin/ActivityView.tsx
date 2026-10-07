"use client";

import * as React from "react";
import Link from "next/link";
import { ReceiptText, RefreshCw, SearchX, ShieldCheck, Undo2 } from "lucide-react";
import { listStoredReceipts } from "@/lib/pos-store";
import { activityFeed, allReceipts, type ActivityItem } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import { Card, LoadingState, PageHeader } from "@/components/ui";
import { cn } from "@/lib/utils";

const KIND_ICON = {
  receipt: ReceiptText,
  refund: Undo2,
  verification: ShieldCheck,
  integration: RefreshCw,
  discrepancy: SearchX,
} as const;

const KIND_FILTERS = [
  { id: "ALL", label: "All activity" },
  { id: "receipt", label: "Receipts" },
  { id: "refund", label: "Refunds" },
  { id: "verification", label: "Verification" },
  { id: "integration", label: "Integration" },
  { id: "discrepancy", label: "Discrepancies" },
] as const;

export default function ActivityView() {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<ActivityItem[]>([]);
  const [kind, setKind] = React.useState<string>("ALL");

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      setItems(activityFeed(allReceipts(listStoredReceipts())));
      setLoading(false);
    }, 350);
    return () => window.clearTimeout(t);
  }, []);

  const filtered = kind === "ALL" ? items : items.filter((a) => a.kind === kind);

  return (
    <div className="container-x section-y flex flex-col gap-6">
      <PageHeader
        title="Platform activity"
        description="Receipts, refunds, verification checks, and integrations — newest first, every row opens its record."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Activity" },
        ]}
      />

      {loading ? (
        <LoadingState variant="skeleton" lines={6} label="Loading activity…" />
      ) : (
        <>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by activity type">
            {KIND_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setKind(f.id)}
                aria-pressed={kind === f.id}
                className={cn(
                  "type-small rounded-full border px-3.5 py-1.5 font-semibold transition-colors",
                  kind === f.id
                    ? "border-[var(--r-primary)] bg-[var(--r-primary)] text-white"
                    : "border-line bg-[var(--r-card)] text-ink-muted hover:border-[var(--r-primary)] hover:text-ink"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Card>
            <ul className="flex flex-col gap-1" aria-label="Activity feed">
              {filtered.map((a) => {
                const Icon = KIND_ICON[a.kind];
                return (
                  <li key={a.id}>
                    <Link
                      href={a.href}
                      className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-background"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-ink-muted transition-colors group-hover:bg-[var(--r-primary-muted)] group-hover:text-[var(--r-primary)]">
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
            {filtered.length === 0 && (
              <p className="type-small px-2 py-6 text-center text-ink-muted">
                No activity of this type yet.
              </p>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
