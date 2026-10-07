"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CreditCard,
  ReceiptText,
  RotateCcw,
  ScanBarcode,
  ScanSearch,
  ShoppingCart,
  Smartphone,
  Store,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { formatDateTime, formatMoney } from "@/lib/format";
import {
  LIVE_CLAIM_LABEL,
  LIVE_LIFECYCLE_ORDER,
  LIVE_METHOD_LABEL,
  liveLifecycleStage,
  pkr,
  type LiveLifecycleStage,
  type LiveTransaction,
} from "@/lib/live-transaction";
import { useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Badge, Button, Card, useToast } from "@/components/ui";
import { useLive } from "./LiveProvider";
import { CustomerDisplay } from "./CustomerDisplay";
import { DbModeBadge } from "./DbModeBadge";
import { MerchantPos } from "./MerchantPos";
import { SyncBadge } from "./SyncBadge";

type Side = "till" | "phone" | null;

const STAGE_META: Record<LiveLifecycleStage, { label: string; icon: LucideIcon; side: Side }> = {
  CREATED: { label: "Created", icon: ShoppingCart, side: "till" },
  ITEMS_ADDED: { label: "Items added", icon: ScanBarcode, side: "till" },
  CHECKOUT: { label: "Checkout", icon: CreditCard, side: "till" },
  PAYMENT_CONFIRMED: { label: "Payment confirmed", icon: BadgeCheck, side: "phone" },
  RECEIPT_ISSUED: { label: "Receipt issued", icon: ReceiptText, side: "phone" },
  RECEIPT_CLAIMED: { label: "Receipt claimed", icon: Wallet, side: null },
};

function evidenceFor(tx: LiveTransaction, stage: LiveLifecycleStage, totalMinor: number, count: number): string {
  switch (stage) {
    case "CREATED":
      return tx.id;
    case "ITEMS_ADDED":
      return `${count} item${count === 1 ? "" : "s"} · ${formatMoney(pkr(totalMinor))}`;
    case "CHECKOUT":
      return `Payable ${formatMoney(pkr(totalMinor))}`;
    case "PAYMENT_CONFIRMED":
      return `${LIVE_METHOD_LABEL[tx.method]} · ${formatDateTime(tx.paidAt ?? tx.createdAt)}`;
    case "RECEIPT_ISSUED":
      return `${tx.receipt?.reference ?? "…"} · saved to backend`;
    case "RECEIPT_CLAIMED":
      return `Claimed via ${LIVE_CLAIM_LABEL[tx.receipt?.claimMethod ?? "qr"]} · in wallet`;
  }
}

function GuideBody({ tx }: { tx: LiveTransaction }) {
  const stage = liveLifecycleStage(tx);
  if (stage === "RECEIPT_CLAIMED") {
    const receipt = tx.receipt;
    if (!receipt) return null; // unreachable: claimed implies a receipt exists
    const ref = receipt.reference;
    return (
      <div className="flex flex-col gap-3">
        <p className="type-small text-ink-muted">
          Receipt <span className="font-mono font-bold text-ink" data-mono>{ref}</span> claimed
          via {LIVE_CLAIM_LABEL[receipt.claimMethod ?? "qr"]}. One transaction now lives in
          three places — that is Receipti infrastructure:
        </p>
        <ul className="flex flex-col gap-1.5">
          {[
            "Merchant — the sale, receipt, and claim sit in Receipt history",
            "Customer — the full receipt is in the Receipti Wallet",
            "Anyone — the record verifies independently by Receipt ID",
          ].map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm font-medium">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--r-verified)]" aria-hidden="true" />
              {t}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <Link href="/live/wallet">
            <Button size="sm" leftIcon={<Wallet className="h-4 w-4" aria-hidden="true" />}>
              Open wallet
            </Button>
          </Link>
          <Link href={`/live/verify?receipt=${encodeURIComponent(ref)}`}>
            <Button size="sm" variant="outline" leftIcon={<ScanSearch className="h-4 w-4" aria-hidden="true" />}>
              Verify {ref}
            </Button>
          </Link>
          <Link href={`/live/receipt/${receipt.claimToken}`}>
            <Button size="sm" variant="outline" leftIcon={<ReceiptText className="h-4 w-4" aria-hidden="true" />}>
              View receipt
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  const copy: Record<Exclude<LiveLifecycleStage, "RECEIPT_CLAIMED">, { title: string; text: React.ReactNode }> = {
    CREATED: {
      title: "A customer walks in",
      text: "On the merchant till, scan any three products — click a product card or enter a barcode. Try the Oversized T-Shirt, Denim Jacket, and Slim Fit Jeans.",
    },
    ITEMS_ADDED: {
      title: "Watch the bill build live",
      text: "Every scan lands on the customer display instantly. Adjust quantities, discounts, or tax if you like — then press Proceed to Payment on the till.",
    },
    CHECKOUT: {
      title: "The customer sees the final amount",
      text: "The bill is locked. On the till, choose a payment method and press Confirm Payment (Demo) — the receipt issues the moment payment confirms.",
    },
    PAYMENT_CONFIRMED: {
      title: "Payment confirmed",
      text: "Issuing the receipt…",
    },
    RECEIPT_ISSUED: {
      title: "Receipt issued and saved",
      text: (
        <>
          Receipt{" "}
          <span className="font-mono font-bold" data-mono>{tx.receipt?.reference ?? "…"}</span>{" "}
          is saved in the Receipti backend. On the customer phone, claim it by QR scan, NFC
          tap, or direct wallet delivery.
        </>
      ),
    },
  };
  const { title, text } = copy[stage];
  return (
    <div className="flex flex-col gap-1.5">
      <p className="type-h3">{title}</p>
      <p className="type-small max-w-2xl text-ink-muted">{text}</p>
    </div>
  );
}

export function ExperienceView() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const { tx, totals, newTransaction } = useLive();
  const stage = liveLifecycleStage(tx);
  const currentIdx = LIVE_LIFECYCLE_ORDER.indexOf(stage);
  const side = STAGE_META[stage]!.side;
  const done = stage === "RECEIPT_CLAIMED";

  const reset = () => {
    newTransaction();
    toast({
      title: "Fresh transaction started",
      description: "Finalized receipts stay safe in history — resetting never deletes them.",
      tone: "info",
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-2xl">
          <p className="type-label text-[var(--r-primary)]">Guided demonstration</p>
          <h1 className="type-h1 mt-1">Experience a Real Transaction with Receipti</h1>
          <p className="type-small mt-1.5 text-ink-muted">
            Drive a real sale end to end: scan on the merchant till, watch the customer display,
            confirm payment, deliver the receipt — then verify it. Every step runs on live
            Receipti infrastructure.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SyncBadge />
          <DbModeBadge />
          <Button variant="outline" size="sm" onClick={reset} leftIcon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}>
            Reset Demo
          </Button>
        </div>
      </div>

      {/* Lifecycle stepper */}
      <Card aria-label="Transaction lifecycle">
        <ol className="flex items-start overflow-x-auto">
          {LIVE_LIFECYCLE_ORDER.map((s, i) => {
            const meta = STAGE_META[s]!;
            const Icon = meta.icon;
            const state = i < currentIdx ? "done" : i === currentIdx ? "current" : "todo";
            return (
              <li
                key={s}
                aria-current={state === "current" ? "step" : undefined}
                className="flex min-w-[6.5rem] flex-1 flex-col items-center px-1 text-center"
              >
                <span className="flex w-full items-center" aria-hidden="true">
                  <span
                    className={cn(
                      "h-0.5 flex-1 rounded-full",
                      i === 0 ? "bg-transparent" : i <= currentIdx ? "bg-[var(--r-verified)]" : "bg-line"
                    )}
                  />
                  <span
                    className={cn(
                      "relative mx-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-colors",
                      state === "done" && "bg-[var(--r-verified-muted)] text-[var(--r-verified)]",
                      state === "current" && "bg-[var(--r-primary)] text-white",
                      state === "todo" && "bg-background text-ink-faint"
                    )}
                  >
                    {state === "current" && !reduce && (
                      <span className="absolute inset-0 animate-ping rounded-2xl bg-[var(--r-primary)] opacity-25" />
                    )}
                    {state === "done" ? (
                      <Check className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    )}
                  </span>
                  <span
                    className={cn(
                      "h-0.5 flex-1 rounded-full",
                      i === LIVE_LIFECYCLE_ORDER.length - 1
                        ? "bg-transparent"
                        : i < currentIdx
                          ? "bg-[var(--r-verified)]"
                          : "bg-line"
                    )}
                  />
                </span>
                <span
                  className={cn(
                    "mt-2 text-xs font-bold leading-tight",
                    state === "todo" ? "text-ink-faint" : "text-ink"
                  )}
                >
                  {meta.label}
                </span>
                {state === "current" && (
                  <span className="type-caption mt-0.5 max-w-full truncate text-ink-muted tnum" title={evidenceFor(tx, s, totals.totalMinor, totals.count)}>
                    {evidenceFor(tx, s, totals.totalMinor, totals.count)}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </Card>

      {/* Guide banner */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={stage}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
        >
          <Card className={cn(done && "border-[var(--r-verified)]")}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex shrink-0 items-center gap-2">
                {side === "till" && (
                  <Badge tone="info" dot>
                    <span className="inline-flex items-center gap-1.5">
                      <Store className="h-3.5 w-3.5" aria-hidden="true" /> Your move — merchant till
                    </span>
                  </Badge>
                )}
                {side === "phone" && (
                  <Badge tone="info" dot>
                    <span className="inline-flex items-center gap-1.5">
                      <Smartphone className="h-3.5 w-3.5" aria-hidden="true" /> Your move — customer phone
                    </span>
                  </Badge>
                )}
                {side === null && (
                  <Badge tone="success" dot>
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" /> Complete
                    </span>
                  </Badge>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <GuideBody tx={tx} />
              </div>
              {done && (
                <div className="shrink-0 sm:self-center">
                  <Button
                    variant="outline"
                    onClick={reset}
                    leftIcon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}
                    rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
                  >
                    Run it again
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Split screen */}
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <section
          aria-label="Merchant till"
          className={cn(
            "rounded-3xl transition-shadow",
            side === "till" && "shadow-[0_0_0_3px_var(--r-primary),var(--shadow-card)]"
          )}
        >
          <MerchantPos />
        </section>
        <section
          aria-label="Customer phone"
          className={cn(
            "rounded-3xl transition-shadow xl:sticky xl:top-24",
            side === "phone" && "shadow-[0_0_0_3px_var(--r-primary),var(--shadow-card)]"
          )}
        >
          <CustomerDisplay />
        </section>
      </div>
    </div>
  );
}
