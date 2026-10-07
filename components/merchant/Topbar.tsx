"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Bell, Check, ChevronDown, Menu, ReceiptText, Undo2 } from "lucide-react";
import { Avatar, Badge, Dropdown, IconButton, Modal, SearchInput } from "@/components/ui";
import { MERCHANTS } from "@/data/merchant-demo";
import { formatDate, formatMoney } from "@/lib/format";
import { aed } from "@/lib/pos";
import { customerLabel } from "@/lib/merchant";
import { useMerchant } from "./MerchantContext";

function merchantInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const router = useRouter();
  const { merchant, merchantId, switchMerchant, receipts, events, searchQuery, setSearchQuery } = useMerchant();
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  const pendingRefunds = receipts.flatMap((r) =>
    (r.refunds ?? [])
      .filter((x) => x.status === "PENDING" || x.status === "PROCESSING")
      .map((x) => ({ key: `${r.reference}-${x.id}`, receipt: r, refund: x }))
  );
  const mismatches = events.filter((e) => e.result === "MISMATCH");
  const latest = receipts[0];
  const badgeCount = pendingRefunds.length + mismatches.length;

  const submitSearch = (value: string) => {
    setSearchQuery(value);
    router.push("/merchant/receipts");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-[var(--r-card)]/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <IconButton
          label="Open navigation menu"
          onClick={onMenu}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </IconButton>

        <Dropdown
          label="Switch demo merchant"
          align="left"
          selectedId={merchantId}
          onSelect={switchMerchant}
          items={MERCHANTS.map((m) => ({ id: m.id, label: `${m.name} — ${m.branch}` }))}
          trigger={
            <button
              type="button"
              aria-label={`Switch demo merchant, current: ${merchant.name}, ${merchant.branch}`}
              className="flex min-w-0 items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-background"
            >
              <Avatar name={merchant.name} size="sm" />
              <span className="hidden min-w-0 sm:block">
                <span className="block truncate text-sm font-bold leading-tight">{merchant.name}</span>
                <span className="type-caption block truncate text-ink-muted">{merchant.branch}</span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
            </button>
          }
        />
        <Badge tone="neutral" dot={false} className="hidden shrink-0 md:inline-flex">
          Demo
        </Badge>

        <span className="flex-1" />

        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitSearch((e.target as HTMLInputElement).value);
          }}
          onClear={() => setSearchQuery("")}
          placeholder="Search receipts…"
          aria-label="Search receipts by ID, customer, or product"
          className="w-36 focus-within:w-52 sm:w-52 sm:focus-within:w-64 transition-[width]"
        />

        <span className="relative shrink-0">
          <IconButton
            label={`Notifications${badgeCount > 0 ? `, ${badgeCount} need attention` : ""}`}
            onClick={() => setNotificationsOpen(true)}
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
          </IconButton>
          {badgeCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute -right-0.5 -top-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-[var(--r-danger)] px-1 text-[0.6875rem] font-bold text-white"
            >
              {badgeCount > 9 ? "9+" : badgeCount}
            </span>
          )}
        </span>
      </div>

      <Modal
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        title="Notifications"
        description="Derived from the demo dataset on this page."
        size="sm"
        footer={
          <button
            type="button"
            onClick={() => setNotificationsOpen(false)}
            className="type-small rounded-lg border border-line px-4 py-2 font-medium transition-colors hover:bg-background"
          >
            Close
          </button>
        }
      >
        <ul className="flex flex-col gap-2.5">
          {pendingRefunds.map(({ key, receipt, refund }) => (
            <li key={key} className="flex items-start gap-3 rounded-xl bg-background px-3.5 py-3">
              <Undo2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--r-warning)]" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">
                  Refund requested · {receipt.id}
                </span>
                <span className="type-caption block text-ink-muted tnum">
                  {formatMoney(aed(refund.amountMinor))} · {customerLabel(receipt)} · {formatDate(refund.createdAt)}
                </span>
              </span>
            </li>
          ))}
          {mismatches.map((e) => (
            <li key={e.id} className="flex items-start gap-3 rounded-xl bg-background px-3.5 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--r-warning)]" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">Mismatch detected · {e.receiptId ?? e.reference}</span>
                <span className="type-caption block text-ink-muted">
                  {e.note ?? "Presented details differed from the trusted record."}
                </span>
              </span>
            </li>
          ))}
          {latest && (
            <li className="flex items-start gap-3 rounded-xl bg-background px-3.5 py-3">
              <ReceiptText className="mt-0.5 h-4 w-4 shrink-0 text-[var(--r-primary)]" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">Latest receipt · {latest.id}</span>
                <span className="type-caption block text-ink-muted tnum">
                  {formatMoney(aed(latest.totalMinor))} · {formatDate(latest.issuedAt)}
                </span>
              </span>
            </li>
          )}
          {pendingRefunds.length === 0 && mismatches.length === 0 && !latest && (
            <li className="flex items-center gap-2 text-sm text-ink-muted">
              <Check className="h-4 w-4 text-[var(--r-verified)]" aria-hidden="true" />
              No new activity in this demo workspace.
            </li>
          )}
        </ul>
        <p className="type-caption mt-3 text-ink-faint">
          Demo only — {merchantInitials(merchant.name)} workspace. No real alerts are sent.
        </p>
      </Modal>
    </header>
  );
}
