"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ReceiptText, ShieldCheck, Undo2 } from "lucide-react";
import type { PosReceipt } from "@/types/pos";
import { formatMoney } from "@/lib/format";
import { aed } from "@/lib/pos";
import { dashboardMetrics, weekBuckets } from "@/lib/merchant";
import { Button, Card, LoadingState, StatCard } from "@/components/ui";
import {
  FadeIn,
  IntegrationCard,
  QuickActions,
  ReceiptDetailDialog,
  ReceiptsChart,
  ReceiptsTable,
  useMerchant,
} from "@/components/merchant";

export default function MerchantOverviewPage() {
  const { merchant, receipts, events, loading } = useMerchant();
  const [selected, setSelected] = React.useState<PosReceipt | null>(null);
  const metrics = dashboardMetrics(receipts, events);
  const buckets = weekBuckets(receipts);

  if (loading) {
    return <LoadingState variant="skeleton" lines={8} label="Loading dashboard…" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <p className="type-label text-[var(--r-primary)]">{merchant.trade}</p>
        <h1 className="type-h1 mt-1">Overview</h1>
        <p className="type-small mt-1 text-ink-muted">
          {merchant.name} · {merchant.branch} · figures computed from the demo dataset
        </p>
      </FadeIn>

      <FadeIn delay={0.05} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's sales"
          value={formatMoney(aed(metrics.todaySalesMinor))}
          hint={`${metrics.receiptsToday} receipt${metrics.receiptsToday === 1 ? "" : "s"} today`}
          icon={<ReceiptText className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label="Digital receipts"
          value={String(metrics.receiptsTotal)}
          trend={
            metrics.receiptsTrendPct !== null
              ? { direction: metrics.receiptsTrendPct >= 0 ? "up" : "down", value: `${metrics.receiptsTrendPct >= 0 ? "+" : ""}${metrics.receiptsTrendPct}%` }
              : undefined
          }
          hint="issued · demo data"
        />
        <StatCard
          label="Refunds today"
          value={formatMoney(aed(metrics.refundsTodayMinor))}
          hint={`${metrics.pendingRefunds} pending · ${metrics.completedRefunds} completed`}
          icon={<Undo2 className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label="Verifications"
          value={String(metrics.verification.requests)}
          hint={`${metrics.verification.verified} verified · ${metrics.verification.mismatch} mismatch`}
          icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />}
        />
      </FadeIn>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <FadeIn delay={0.08}>
          <Card as="section" aria-label="Receipts issued" className="h-full">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[0.9375rem] font-semibold">Digital receipts issued</h2>
              <p className="type-caption text-ink-faint">Last 7 days · demo</p>
            </div>
            <div className="mt-3">
              <ReceiptsChart buckets={buckets} />
            </div>
          </Card>
        </FadeIn>
        <FadeIn delay={0.1}>
          <IntegrationCard merchant={merchant} receipts={receipts} />
        </FadeIn>
      </div>

      <FadeIn delay={0.12}>
        <section aria-label="Recent transactions" className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="type-h3">Recent transactions</h2>
            <Link href="/merchant/receipts">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
                View all
              </Button>
            </Link>
          </div>
          <ReceiptsTable rows={receipts.slice(0, 6)} loading={false} onView={setSelected} />
        </section>
      </FadeIn>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FadeIn delay={0.14}>
          <Card as="section" aria-label="Refund activity" className="h-full">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[0.9375rem] font-semibold">Refund activity</h2>
              <Link href="/merchant/refunds">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
                  All refunds
                </Button>
              </Link>
            </div>
            <dl className="mt-3 grid grid-cols-3 gap-2">
              {[
                ["Today", formatMoney(aed(metrics.refundsTodayMinor))],
                ["Pending", String(metrics.pendingRefunds)],
                ["Completed", String(metrics.completedRefunds)],
              ].map(([term, value]) => (
                <div key={term} className="rounded-xl bg-background px-3 py-2.5 text-center">
                  <dt className="type-caption text-ink-faint">{term}</dt>
                  <dd className="type-small mt-0.5 font-bold tnum" data-numeric>{value}</dd>
                </div>
              ))}
            </dl>
            <p className="type-caption mt-3 text-ink-faint">
              Completed refunds move money; pending requests do not — matching the receipt record.
            </p>
          </Card>
        </FadeIn>
        <FadeIn delay={0.16}>
          <Card as="section" aria-label="Verification activity" className="h-full">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[0.9375rem] font-semibold">Verification activity</h2>
              <Link href="/merchant/verification">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
                  All events
                </Button>
              </Link>
            </div>
            <dl className="mt-3 grid grid-cols-4 gap-2">
              {[
                ["Requests", metrics.verification.requests],
                ["Verified", metrics.verification.verified],
                ["Mismatch", metrics.verification.mismatch],
                ["Not found", metrics.verification.notFound],
              ].map(([term, value]) => (
                <div key={term as string} className="rounded-xl bg-background px-2 py-2.5 text-center">
                  <dt className="type-caption text-ink-faint">{term as string}</dt>
                  <dd className="type-small mt-0.5 font-bold tnum" data-numeric>{value as number}</dd>
                </div>
              ))}
            </dl>
            <p className="type-caption mt-3 text-ink-faint">
              Receipti reports the state of the receipt record — never fraud verdicts.
            </p>
          </Card>
        </FadeIn>
      </div>

      <FadeIn delay={0.18}>
        <QuickActions />
      </FadeIn>

      <ReceiptDetailDialog receipt={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
