"use client";

import * as React from "react";
import Link from "next/link";
import {
  Check,
  Code2,
  FileCheck2,
  Fingerprint,
  Gauge,
  KeyRound,
  Lock,
  Plug,
  ScrollText,
  ShieldCheck,
  Store,
  Webhook,
  type LucideIcon,
} from "lucide-react";
import type { Merchant } from "@/types/merchant";
import type { PosReceipt } from "@/types/pos";
import { formatDateTime } from "@/lib/format";
import { syncStatsFor, webhookEventsFor } from "@/lib/integration";
import { Badge, Button, Card } from "@/components/ui";
import { cn } from "@/lib/utils";

/* ---------------- connection methods ---------------- */

const METHODS: { icon: LucideIcon; title: string; body: string; badge: string; live: boolean }[] = [
  {
    icon: Code2,
    title: "API",
    body: "Send transactions to Receipti from any POS, ERP, or commerce backend over HTTPS.",
    badge: "Available in demo",
    live: true,
  },
  {
    icon: Webhook,
    title: "Webhooks",
    body: "Receipti notifies your systems when receipts, payments, and refunds change state.",
    badge: "Available in demo",
    live: true,
  },
  {
    icon: Store,
    title: "Connector / merchant tools",
    body: "For businesses without a suitable POS, Receipti provides a merchant-side receipt system.",
    badge: "Coming soon",
    live: false,
  },
];

export function MethodsGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" role="list" aria-label="Connection methods">
      {METHODS.map((m) => {
        const Icon = m.icon;
        return (
          <Card key={m.title} role="listitem" className="flex flex-col">
            <p
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-xl",
                m.live ? "bg-[var(--r-primary-muted)] text-[var(--r-primary)]" : "bg-background text-ink-faint"
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </p>
            <h2 className="mt-3 text-[0.9375rem] font-semibold">{m.title}</h2>
            <p className="type-small mt-1 flex-1 text-ink-muted">{m.body}</p>
            <p className="mt-3">
              <Badge tone={m.live ? "success" : "neutral"} dot={m.live}>
                {m.badge}
              </Badge>
            </p>
          </Card>
        );
      })}
    </div>
  );
}

/* ---------------- integration health ---------------- */

export function HealthCard({ receipts }: { receipts: PosReceipt[] }) {
  const stats = syncStatsFor(receipts);
  const failedEvents = webhookEventsFor(receipts).filter((e) => e.status === "FAILED").length;
  const rows: { term: string; ok: boolean; value: string }[] = [
    { term: "Connection", ok: true, value: "Healthy" },
    { term: "API", ok: true, value: "Operational" },
    { term: "Webhooks", ok: failedEvents === 0, value: failedEvents === 0 ? "Operational" : "Operational · 1 ignored duplicate" },
  ];
  return (
    <Card as="section" aria-label="Integration health" className="h-full">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[0.9375rem] font-semibold">Integration health</h2>
        <Badge tone="neutral">Demo</Badge>
      </div>
      <ul className="mt-3 space-y-2">
        {rows.map((r) => (
          <li key={r.term} className="flex items-center justify-between gap-3">
            <span className="type-small text-ink-muted">{r.term}</span>
            <span
              className={cn(
                "type-status inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
                r.ok
                  ? "bg-[var(--r-verified-muted)] text-[var(--r-verified)]"
                  : "bg-[var(--r-warning-muted)] text-[var(--r-warning)]"
              )}
            >
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              {r.value}
            </span>
          </li>
        ))}
      </ul>
      <dl className="type-small mt-3 space-y-1.5 border-t border-line pt-3 text-ink-muted">
        <div className="flex justify-between gap-3">
          <dt>Last synchronization</dt>
          <dd className="font-semibold text-ink tnum">
            {stats.lastSync ? formatDateTime(stats.lastSync) : "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Failed events</dt>
          <dd className="font-semibold text-ink tnum" data-numeric>{failedEvents}</dd>
        </div>
      </dl>
      <p className="type-caption mt-3 text-ink-faint">
        Demo health only — not infrastructure uptime.
      </p>
    </Card>
  );
}

/* ---------------- security ---------------- */

const SECURITY: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: KeyRound, title: "API keys", body: "Each merchant workspace connects with its own revocable key." },
  { icon: Lock, title: "TLS", body: "Receipt data travels over encrypted HTTPS connections." },
  { icon: FileCheck2, title: "Webhook signatures", body: "Receipti can verify events were sent by the configured integration." },
  { icon: ShieldCheck, title: "Scoped access", body: "Keys only permit the receipt data the merchant approves below." },
  { icon: Gauge, title: "Rate limiting", body: "Burst protection keeps a busy checkout from overwhelming the API." },
  { icon: Fingerprint, title: "Idempotency", body: "Retried transactions return the existing receipt, never a duplicate." },
  { icon: ScrollText, title: "Audit logs", body: "Every receipt, refund, and verification event keeps its trail." },
];

export function SecurityGrid() {
  return (
    <Card as="section" aria-label="Integration security">
      <h2 className="text-[0.9375rem] font-semibold">Security, in plain terms</h2>
      <p className="type-small mt-1 text-ink-muted">
        How the production design protects the receipt layer. This prototype demonstrates
        the concepts — it enforces none of them.
      </p>
      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {SECURITY.map((s) => {
          const Icon = s.icon;
          return (
            <li key={s.title} className="flex items-start gap-3 rounded-xl bg-background px-3.5 py-3">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--r-primary)]" aria-hidden="true" />
              <span>
                <span className="block text-sm font-semibold">{s.title}</span>
                <span className="type-caption mt-0.5 block text-ink-muted">{s.body}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* ---------------- permissions ---------------- */

const PERMISSIONS: { id: string; label: string; body: string; initial: boolean }[] = [
  { id: "create", label: "Receipt creation", body: "Send new transactions as receipts.", initial: true },
  { id: "update", label: "Receipt updates", body: "Send corrections to existing records.", initial: true },
  { id: "refund", label: "Refund events", body: "Link refunds to their receipts.", initial: true },
  { id: "customer", label: "Customer reference", body: "Attach a customer label for lookup.", initial: true },
  { id: "media", label: "Product media", body: "Attach imagery to receipt lines.", initial: true },
  { id: "analytics", label: "Analytics", body: "Share aggregate sales figures.", initial: false },
];

export function PermissionsCard() {
  const [state, setState] = React.useState<Record<string, boolean>>(
    Object.fromEntries(PERMISSIONS.map((p) => [p.id, p.initial]))
  );
  return (
    <Card as="section" aria-label="Integration permissions" className="h-full">
      <h2 className="text-[0.9375rem] font-semibold">Permissions</h2>
      <p className="type-small mt-1 text-ink-muted">
        What this integration is allowed to send. Frontend demo state — nothing is
        enforced.
      </p>
      <ul className="mt-3 grid grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-x-8">
        {PERMISSIONS.map((p) => {
          const on = state[p.id] ?? false;
          return (
            <li key={p.id} className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-background">
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{p.label}</span>
                <span className="type-caption block text-ink-muted">{p.body}</span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={p.label}
                onClick={() => setState((s) => ({ ...s, [p.id]: !on }))}
                className={cn(
                  "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                  on ? "bg-[var(--r-primary)]" : "bg-[var(--r-line)]"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left] motion-reduce:transition-none",
                    on ? "left-[1.375rem]" : "left-0.5"
                  )}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* ---------------- POS boundary ---------------- */

const POS_HANDLES = ["Sale", "Payment", "Inventory", "Customer transaction"];
const RECEIPTI_HANDLES = [
  "Digital receipt",
  "Receipt storage / reference",
  "Customer receipt access",
  "Refund record linkage",
  "Verification",
  "Receipt delivery",
];

export function PosBoundary() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card as="section" aria-label="What the existing POS handles">
        <h2 className="flex items-center gap-2 text-[0.9375rem] font-semibold">
          <Store className="h-4 w-4 text-ink-muted" aria-hidden="true" />
          Existing POS
        </h2>
        <p className="type-small mt-1 text-ink-muted">Stays exactly where it is — the system of record.</p>
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {POS_HANDLES.map((h) => (
            <li key={h} className="type-small rounded-xl bg-background px-3.5 py-2.5 font-medium">
              {h}
            </li>
          ))}
        </ul>
      </Card>
      <Card as="section" aria-label="What Receipti handles">
        <h2 className="flex items-center gap-2 text-[0.9375rem] font-semibold">
          <Plug className="h-4 w-4 text-ink-muted" aria-hidden="true" />
          Receipti
        </h2>
        <p className="type-small mt-1 text-ink-muted">The digital receipt layer on top — never a POS replacement.</p>
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {RECEIPTI_HANDLES.map((h) => (
            <li key={h} className="type-small flex items-center gap-1.5 rounded-xl bg-[var(--r-primary-muted)] px-3.5 py-2.5 font-medium text-[var(--r-primary)]">
              <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {h}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ---------------- no-POS ---------------- */

export function NoPosCard() {
  return (
    <Card as="section" aria-label="Merchants without a POS" className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--r-dark)] text-[var(--r-on-dark)]">
        <Store className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <h2 className="text-[0.9375rem] font-semibold">No existing POS?</h2>
        <p className="type-small mt-0.5 text-ink-muted">
          Receipti can provide a merchant-side receipt system for businesses without a
          suitable digital transaction system.
        </p>
      </span>
      <Link href="/demo/merchant-pos" className="shrink-0">
        <Button>Explore Receipti merchant tools</Button>
      </Link>
    </Card>
  );
}

/* ---------------- page header helper ---------------- */

export function IntegrationHeading({ merchant }: { merchant: Merchant }) {
  return (
    <div>
      <p className="type-label text-[var(--r-primary)]">Integration</p>
      <h1 className="type-h1 mt-1">Connect {merchant.posName} to Receipti</h1>
      <p className="type-small mt-1 max-w-2xl text-ink-muted">
        Send transaction and receipt data from your POS, ERP, or commerce system to
        Receipti and automatically create digital receipts for customers. POS
        coverage varies by system — this demo shows the concept.
      </p>
    </div>
  );
}
