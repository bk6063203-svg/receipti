"use client";

import * as React from "react";
import type { WebhookEvent } from "@/types/integration";
import { webhookEventsFor } from "@/lib/integration";
import { StatCard } from "@/components/ui";
import { FadeIn, useMerchant } from "@/components/merchant";
import { IntegrationTabs, WebhookDetailDialog, WebhooksTable } from "@/components/integration";

export default function MerchantWebhooksPage() {
  const { merchant, receipts, loading } = useMerchant();
  const [selected, setSelected] = React.useState<WebhookEvent | null>(null);
  const events = React.useMemo(() => webhookEventsFor(receipts), [receipts]);
  const counts = {
    success: events.filter((e) => e.status === "SUCCESS").length,
    pending: events.filter((e) => e.status === "PENDING").length,
    failed: events.filter((e) => e.status === "FAILED").length,
  };

  return (
    <div className="flex flex-col gap-5">
      <FadeIn className="flex flex-col gap-4">
        <div>
          <p className="type-label text-[var(--r-primary)]">Integration · {merchant.name}</p>
          <h1 className="type-h1 mt-1">Webhooks</h1>
          <p className="type-small mt-1 max-w-2xl text-ink-muted">
            Demo deliveries from Receipti to the merchant endpoint — receipt, payment,
            and refund events with their payloads. Select an event to inspect it.
          </p>
        </div>
        <IntegrationTabs />
      </FadeIn>

      <FadeIn delay={0.05} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Delivered" value={String(counts.success)} hint="demo deliveries" />
        <StatCard label="Pending" value={String(counts.pending)} hint="awaiting the merchant" />
        <StatCard label="Failed" value={String(counts.failed)} hint="see the delivery note" />
      </FadeIn>

      <FadeIn delay={0.08}>
        <WebhooksTable events={events} loading={loading} onView={setSelected} />
      </FadeIn>

      <WebhookDetailDialog event={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
