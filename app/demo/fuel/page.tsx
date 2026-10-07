"use client";

import * as React from "react";
import type { PosReceipt } from "@/types/pos";
import { loadReceipt } from "@/lib/receipt-loader";
import {
  compareFuelTransaction,
  FUEL_DEMO,
  recordFromReceipt,
  scenarioPresented,
  type FuelCheckResult,
  type FuelRecord,
  type PresentedFuelInfo,
} from "@/lib/fuel-check";
import { saveFuelCheck } from "@/lib/customer";
import { pushNotifyEvent } from "@/lib/notify";
import { Card, PageHeader } from "@/components/ui";
import { FadeIn } from "@/components/merchant";
import {
  FuelPosCard,
  FuelTimeline,
  MerchantSideCard,
  ReceiptReadyCard,
  RefundStrip,
  StatusStrip,
  TransactionCheck,
  type CheckEvent,
  type ComparisonState,
  type FuelScenario,
} from "@/components/fuel";

const CONSTANT_RECORD: FuelRecord = {
  fuelType: FUEL_DEMO.fuelType,
  quantityL: FUEL_DEMO.quantityL,
  priceMinorPerL: FUEL_DEMO.priceMinorPerL,
  totalMinor: Math.round(FUEL_DEMO.quantityL * FUEL_DEMO.priceMinorPerL),
  transactionId: FUEL_DEMO.transactionId,
  currency: FUEL_DEMO.currency,
};

type RecordStatus = "idle" | "loading" | "found" | "not-found";

export default function FuelDemoPage() {
  const [receipt, setReceipt] = React.useState<PosReceipt | null>(null);
  const [record, setRecord] = React.useState<FuelRecord | null>(null);
  const [recordStatus, setRecordStatus] = React.useState<RecordStatus>("idle");
  const [loadedAt, setLoadedAt] = React.useState<string | null>(null);
  const [scenario, setScenario] = React.useState<FuelScenario | "custom">("matching");
  const [presented, setPresented] = React.useState<PresentedFuelInfo>(() =>
    scenarioPresented("matching", CONSTANT_RECORD)
  );
  const [checks, setChecks] = React.useState<CheckEvent[]>([]);
  const [reported, setReported] = React.useState(false);

  const load = React.useCallback(async (reference: string) => {
    setRecordStatus("loading");
    const res = await loadReceipt(reference);
    if (res.kind === "found") {
      setReceipt(res.receipt);
      setRecord(recordFromReceipt(res.receipt));
      setRecordStatus("found");
      setLoadedAt(new Date().toISOString());
    } else {
      setRecord(null);
      setRecordStatus("not-found");
    }
  }, []);

  const result: FuelCheckResult | null = React.useMemo(() => {
    if (!record || recordStatus !== "found") return null;
    return compareFuelTransaction(presented, record);
  }, [presented, record, recordStatus]);

  const comparison: ComparisonState =
    result === null ? "none" : result.allMatch ? "match" : "mismatch";

  // Timeline grows as the verdict changes; report flag resets with it.
  const signature = result
    ? `${result.matched}/${result.total}:${result.fields.map((f) => (f.status === "MATCH" ? "1" : "0")).join("")}`
    : "none";
  React.useEffect(() => {
    if (!result) return;
    setReported(false);
    saveFuelCheck({
      reference: receipt?.reference ?? null,
      at: new Date().toISOString(),
      summary: result.allMatch ? "Transaction checked — matched" : "Transaction checked — discrepancy detected",
      mismatch: !result.allMatch,
    });
    if (!result.allMatch) {
      pushNotifyEvent({
        kind: "fuel",
        title: "Fuel discrepancy detected",
        detail: receipt?.reference
          ? `Slip ${receipt.reference} · presented vs recorded`
          : "Presented fuel info differs from the merchant record",
        href: "/demo/fuel",
      });
    }
    setChecks((prev) => {
      const next: CheckEvent[] = [
        ...prev,
        {
          at: new Date().toISOString(),
          summary: result.allMatch ? "Transaction checked — matched" : "Transaction checked — discrepancy detected",
          mismatch: !result.allMatch,
        },
      ];
      return next.slice(-3);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const applyScenario = (s: FuelScenario) => {
    setScenario(s);
    if (s === "not-found") {
      load(FUEL_DEMO.unknownReference);
      return;
    }
    setPresented(scenarioPresented(s, record ?? CONSTANT_RECORD));
    if (receipt && recordStatus !== "found") load(receipt.reference);
  };

  const applyPresented = (p: PresentedFuelInfo) => {
    setPresented(p);
    setScenario("custom");
  };

  return (
    <div className="container-x section-y flex flex-col gap-6">
      <FadeIn>
        <PageHeader
          title="Fuel transaction check"
          description="Buy fuel at a simulated POS, receive the Receipti record, then compare presented figures against it. Receipti reports differences — it never decides what they mean."
          breadcrumb={[{ label: "Home", href: "/" }, { label: "Demo", href: "/demo" }, { label: "Fuel" }]}
        />
      </FadeIn>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FadeIn delay={0.05}>
          <FuelPosCard
            completed={receipt !== null}
            onComplete={(r) => {
              setReceipt(r);
              load(r.reference);
            }}
          />
        </FadeIn>
        <FadeIn delay={0.08}>
          {receipt ? (
            <ReceiptReadyCard receipt={receipt} />
          ) : (
            <Card as="section" aria-label="Receipt pending" className="flex h-full min-h-[16rem] flex-col items-center justify-center border-dashed text-center">
              <p className="type-label text-ink-faint">Receipti record</p>
              <p className="type-small mt-1 max-w-xs text-ink-muted">
                Complete the transaction and the digital receipt appears here with the
                same ID across POS, receipt, verification, and dashboard.
              </p>
            </Card>
          )}
        </FadeIn>
      </div>

      {receipt && (
        <FadeIn delay={0.1}>
          <StatusStrip receipt={receipt} comparison={comparison} />
        </FadeIn>
      )}

      <FadeIn delay={0.12}>
        <TransactionCheck
          record={record}
          recordStatus={recordStatus}
          receiptRef={receipt?.reference ?? null}
          scenario={scenario}
          onScenario={applyScenario}
          presented={presented}
          onPresented={applyPresented}
          result={result}
          reported={reported}
          onReport={() => setReported(true)}
        />
      </FadeIn>

      {receipt && (
        <>
          <FadeIn delay={0.14}>
            <RefundStrip receipt={receipt} onReload={() => load(receipt.reference)} />
          </FadeIn>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <FadeIn delay={0.16}>
              <FuelTimeline receipt={receipt} loadedAt={loadedAt} checks={checks} />
            </FadeIn>
            <FadeIn delay={0.18}>
              <MerchantSideCard receipt={receipt} comparison={comparison} />
            </FadeIn>
          </div>
        </>
      )}

      <p className="type-caption mx-auto max-w-2xl text-center text-ink-faint">
        Frontend demonstration only. No fuel-system integration, no fraud detection,
        no complaint filing — the same local receipt model as every other Receipti demo.
      </p>
    </div>
  );
}
