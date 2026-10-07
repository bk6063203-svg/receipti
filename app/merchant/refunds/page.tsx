"use client";

import * as React from "react";
import Link from "next/link";
import { ScanSearch } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { pushNotifyEvent } from "@/lib/notify";
import { aed } from "@/lib/pos";
import { dashboardMetrics, dayKey, refundRows, todayKey, type RefundRow } from "@/lib/merchant";
import { Button, Card, StatCard, useToast } from "@/components/ui";
import { updateRefundStatus } from "@/lib/refunds";
import { saveReceipt } from "@/lib/pos-store";
import { FadeIn, RefundsTable, useMerchant } from "@/components/merchant";

export default function MerchantRefundsPage() {
  const { merchant, receipts, events, loading, refresh } = useMerchant();
  const { toast } = useToast();
  const metrics = dashboardMetrics(receipts, events);
  const rows = React.useMemo(() => refundRows(receipts), [receipts]);
  const todayCount = rows.filter((r) => dayKey(r.refund.createdAt) === todayKey()).length;

  const approve = (row: RefundRow) => {
    const live = receipts.find((r) => r.reference === row.receipt.reference) ?? row.receipt;
    const updated = updateRefundStatus(live, row.refund.id, "COMPLETED");
    saveReceipt(updated);
    refresh();
    pushNotifyEvent({
      kind: "refund-completed",
      title: `Refund approved · ${formatMoney(aed(row.refund.amountMinor))}`,
      detail: `${live.merchant} · ${live.id} · ${row.refund.id}`,
      href: `/receipt/${live.reference}#refunds`,
    });
    toast({ title: "Refund approved", description: `${row.refund.id} completed — receipt and wallet update everywhere.`, tone: "success" });
  };

  return (
    <div className="flex flex-col gap-5">
      <FadeIn>
        <p className="type-label text-[var(--r-primary)]">{merchant.name}</p>
        <h1 className="type-h1 mt-1">Refunds</h1>
        <p className="type-small mt-1 text-ink-muted">
          Refund events linked to receipts — the same records customers see. Opening a
          refund takes you to its receipt.
        </p>
      </FadeIn>

      <FadeIn delay={0.05} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Refunds today"
          value={formatMoney(aed(metrics.refundsTodayMinor))}
          hint={`${todayCount} event${todayCount === 1 ? "" : "s"} recorded today`}
        />
        <StatCard
          label="Pending"
          value={String(metrics.pendingRefunds)}
          hint="requested, moves no money yet"
        />
        <StatCard
          label="Completed"
          value={String(metrics.completedRefunds)}
          hint="deducted from receipt totals"
        />
      </FadeIn>

      <FadeIn delay={0.07}>
        <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <ScanSearch className="h-8 w-8 shrink-0 text-[var(--r-primary)]" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h2 className="type-h4">Customer at the counter?</h2>
            <p className="type-small mt-0.5 text-ink-muted">
              Check their slip before approving a return — paste the RCP_ reference,
              receipt number, or transaction id.
            </p>
          </div>
          <Link href="/verify" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">Verify customer slip</Button>
          </Link>
        </Card>
      </FadeIn>

      <FadeIn delay={0.08}>
        <RefundsTable rows={rows} loading={loading} onApprove={approve} />
      </FadeIn>
    </div>
  );
}
