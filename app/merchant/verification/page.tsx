"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ScanSearch } from "lucide-react";
import { extractReference } from "@/lib/verify";
import { dashboardMetrics } from "@/lib/merchant";
import { Button, Card, Input, StatCard } from "@/components/ui";
import { FadeIn, useMerchant, VerificationTable } from "@/components/merchant";

export default function MerchantVerificationPage() {
  const { merchant, receipts, events, loading } = useMerchant();
  const v = dashboardMetrics(receipts, events).verification;
  const router = useRouter();
  const [slip, setSlip] = React.useState("");

  const checkSlip = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = extractReference(slip);
    if (ref !== "") router.push(`/verify/${encodeURIComponent(ref)}`);
  };

  return (
    <div className="flex flex-col gap-5">
      <FadeIn>
        <p className="type-label text-[var(--r-primary)]">{merchant.name}</p>
        <h1 className="type-h1 mt-1">Verification</h1>
        <p className="type-small mt-1 text-ink-muted">
          Verification requests against {merchant.posName} records. Receipti reports the
          state of the receipt record — mismatches are factual findings, never fraud
          verdicts. Opening an event shows its receipt or verification result.
        </p>
      </FadeIn>

      <FadeIn delay={0.04}>
        <Card as="section" aria-label="Check a customer slip">
          <h2 className="type-h4">Check a customer slip</h2>
          <p className="type-small mt-1 text-ink-muted">
            Works with the RCP_ reference, the receipt number, or the transaction id.
          </p>
          <form onSubmit={checkSlip} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input
              value={slip}
              onChange={(e) => setSlip(e.target.value)}
              placeholder="RCP_… · RCPT-… · TXN id"
              aria-label="Slip reference, receipt number, or transaction id"
              className="sm:max-w-sm"
              data-mono
            />
            <Button type="submit" leftIcon={<ScanSearch className="h-4 w-4" aria-hidden="true" />}>
              Check slip
            </Button>
          </form>
        </Card>
      </FadeIn>

      <FadeIn delay={0.05} className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Requests" value={String(v.requests)} hint="demo request log" />
        <StatCard label="Verified" value={String(v.verified)} hint="matched the record" />
        <StatCard label="Mismatch" value={String(v.mismatch)} hint="presented data differed" />
        <StatCard label="Not found" value={String(v.notFound)} hint="no record resolved" />
      </FadeIn>

      <FadeIn delay={0.08}>
        <VerificationTable events={events} loading={loading} />
      </FadeIn>
    </div>
  );
}
