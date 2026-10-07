"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
  ShoppingBag,
  Smartphone,
  Store,
  Trash2,
  Wallet,
} from "lucide-react";
import type { CartItem, PosPaymentMethod, PosReceipt, Product } from "@/types/pos";
import { POS_CATEGORIES, POS_PRODUCTS } from "@/data/pos-catalog";
import { formatMoney } from "@/lib/format";
import {
  aed,
  buildReference,
  cartCount,
  cartSubtotalMinor,
  createReceipt,
  createTransaction,
  inclusiveTaxMinor,
  PAYMENT_METHOD_LABEL,
} from "@/lib/pos";
import { nextSequence, saveReceipt } from "@/lib/pos-store";
import { setReceiptSaved } from "@/lib/wallet-store";
import { pushNotifyEvent } from "@/lib/notify";
import { ProductCard } from "@/components/pos/ProductCard";
import { ReceiveChoice } from "./ReceiveChoice";
import { ReceiptReady } from "@/components/pos/ReceiptReady";
import { Badge, Button, Card, Divider, EmptyState, IconButton, Input, useToast } from "@/components/ui";
import { useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Phase = "shop" | "checkout" | "processing" | "handoff" | "ready";
type ProcStage = "payment" | "creating";

const METHOD_ICON: Record<PosPaymentMethod, typeof CreditCard> = {
  CARD: CreditCard,
  CASH: Banknote,
  DIGITAL: Smartphone,
};

const STEPS: { id: Phase; label: string }[] = [
  { id: "shop", label: "Shop" },
  { id: "checkout", label: "Checkout" },
  { id: "processing", label: "Receipt" },
];

function stepIndex(phase: Phase): number {
  if (phase === "shop") return 0;
  if (phase === "checkout") return 1;
  return 2;
}

export function ShopExperience() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [phase, setPhase] = React.useState<Phase>("shop");
  const [procStage, setProcStage] = React.useState<ProcStage>("payment");
  const [category, setCategory] = React.useState<(typeof POS_CATEGORIES)[number]>("All");
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [name, setName] = React.useState("");
  const [method, setMethod] = React.useState<PosPaymentMethod>("CARD");
  const [receipt, setReceipt] = React.useState<PosReceipt | null>(null);
  const [saved, setSaved] = React.useState(false);
  const timers = React.useRef<number[]>([]);

  React.useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const add = React.useCallback((product: Product) => {
    setItems((prev) => {
      const found = prev.find((i) => i.product.id === product.id);
      if (found)
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const setLineQty = React.useCallback((id: string, next: number) => {
    setItems((prev) =>
      next <= 0
        ? prev.filter((i) => i.product.id !== id)
        : prev.map((i) => (i.product.id === id ? { ...i, quantity: next } : i))
    );
  }, []);

  const count = cartCount(items);
  const subtotal = cartSubtotalMinor(items);
  const tax = inclusiveTaxMinor(subtotal);
  const shown = category === "All" ? POS_PRODUCTS : POS_PRODUCTS.filter((p) => p.category === category);

  const pay = () => {
    if (items.length === 0) return;
    setPhase("processing");
    setProcStage("payment");
    later(() => {
      setProcStage("creating");
      later(() => {
        const seq = nextSequence();
        const tx = createTransaction(items, method, seq);
        const rec = createReceipt(tx, seq, buildReference());
        const customerName = name.trim();
        const final: PosReceipt = customerName ? { ...rec, customerName } : rec;
        try {
          saveReceipt(final);
        } catch {
          /* receipt still displays even if storage fails */
        }
        pushNotifyEvent({
          kind: "sale",
          title: `Sale completed · ${formatMoney(aed(final.totalMinor))}`,
          detail: `${final.merchant} · ${final.id} · ${PAYMENT_METHOD_LABEL[method]}${customerName ? ` · ${customerName}` : ""}`,
          href: `/receipt/${final.reference}`,
        });
        setReceipt(final);
        setSaved(false);
        setPhase("handoff");
      }, 900);
    }, 1100);
  };

  const restart = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setItems([]);
    setName("");
    setMethod("CARD");
    setReceipt(null);
    setSaved(false);
    setPhase("shop");
  };

  const saveToWallet = () => {
    if (!receipt) return;
    setReceiptSaved(receipt.reference, true);
    setSaved(true);
    toast({ title: "Saved to wallet", description: "This receipt now lives in the customer wallet.", tone: "success" });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Store header */}
      <div className="slip-no-print flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="type-label flex items-center gap-1.5 text-[var(--r-primary)]">
            <Store className="h-3.5 w-3.5" aria-hidden="true" /> Urban Threads · Dubai Mall
          </p>
          <h1 className="type-h1 mt-1">Shop &amp; pay</h1>
          <p className="type-small mt-1 text-ink-muted">
            A customer storefront on the same transaction engine as the merchant till —
            no sign-in, no verification, just shop and pay.
          </p>
        </div>
        {/* Stepper */}
        <ol className="flex items-center gap-1.5" aria-label="Checkout progress">
          {STEPS.map((s, i) => {
            const active = stepIndex(phase) === i;
            const done = stepIndex(phase) > i;
            return (
              <li key={s.id} className="flex items-center gap-1.5">
                {i > 0 && <span className="h-px w-6 bg-line" aria-hidden="true" />}
                <span
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
                    active
                      ? "bg-[var(--r-primary)] text-white"
                      : done
                        ? "bg-[var(--r-verified-muted)] text-[var(--r-verified)]"
                        : "bg-background text-ink-faint"
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <span className="tnum">{i + 1}</span>}
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {phase === "shop" && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Categories">
                {POS_CATEGORIES.map((c) => (
                  <Button
                    key={c}
                    size="sm"
                    variant={category === c ? "primary" : "outline"}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </Button>
                ))}
              </div>
              {shown.length === 0 ? (
                <EmptyState
                  icon={<ShoppingBag className="h-8 w-8" aria-hidden="true" />}
                  title="Nothing here yet"
                  description="Try another category."
                />
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {shown.map((p) => (
                    <ProductCard key={p.id} product={p} onAdd={add} />
                  ))}
                </div>
              )}
              {/* Sticky cart bar */}
              <div className="sticky bottom-4 z-10">
                <Card className="flex flex-wrap items-center gap-3 shadow-card">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <ShoppingBag className="h-4 w-4 text-[var(--r-primary)]" aria-hidden="true" />
                    {count === 0 ? "Bag is empty" : `${count} item${count === 1 ? "" : "s"}`}
                  </span>
                  {count > 0 && (
                    <Badge className="tnum">{formatMoney(aed(subtotal))}</Badge>
                  )}
                  <span className="flex-1" />
                  <Button
                    disabled={count === 0}
                    onClick={() => setPhase("checkout")}
                    rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
                  >
                    Checkout
                  </Button>
                </Card>
              </div>
            </div>
          )}

          {phase === "checkout" && (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <Card className="flex flex-col gap-3">
                <h2 className="type-h3">Your bag</h2>
                {items.length === 0 ? (
                  <EmptyState
                    icon={<ShoppingBag className="h-8 w-8" aria-hidden="true" />}
                    title="Bag is empty"
                    description="Head back to the shop to add something."
                    action={
                      <Button variant="outline" onClick={() => setPhase("shop")}>
                        Back to shop
                      </Button>
                    }
                  />
                ) : (
                  <ul className="flex flex-col gap-2.5">
                    {items.map((i) => (
                      <li key={i.product.id} className="flex items-center gap-3 rounded-xl border border-line px-3.5 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{i.product.name}</p>
                          <p className="type-caption mt-0.5 text-ink-muted tnum">
                            {formatMoney(i.product.price)} each
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1" role="group" aria-label={`Quantity for ${i.product.name}`}>
                          <IconButton
                            label={`Decrease quantity of ${i.product.name}`}
                            size="sm"
                            variant="outline"
                            onClick={() => setLineQty(i.product.id, i.quantity - 1)}
                          >
                            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                          </IconButton>
                          <span className="w-7 text-center text-sm font-bold tnum">{i.quantity}</span>
                          <IconButton
                            label={`Increase quantity of ${i.product.name}`}
                            size="sm"
                            variant="outline"
                            onClick={() => setLineQty(i.product.id, i.quantity + 1)}
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          </IconButton>
                        </div>
                        <span className="w-20 shrink-0 text-right text-sm font-bold tnum">
                          {formatMoney(aed(i.product.price.amountMinor * i.quantity))}
                        </span>
                        <IconButton
                          label={`Remove ${i.product.name}`}
                          size="sm"
                          variant="ghost"
                          onClick={() => setLineQty(i.product.id, 0)}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </IconButton>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <div className="flex flex-col gap-5">
                <Card className="flex flex-col gap-3">
                  <h2 className="type-h3">Payment</h2>
                  <Input
                    label="Name for the receipt (optional)"
                    placeholder="e.g. Sara Ahmed"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="off"
                  />
                  <div role="radiogroup" aria-label="Payment method" className="flex flex-col gap-2">
                    {(Object.keys(PAYMENT_METHOD_LABEL) as PosPaymentMethod[]).map((m) => {
                      const Icon = METHOD_ICON[m];
                      const selected = method === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => setMethod(m)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm font-semibold transition-colors",
                            selected
                              ? "border-[var(--r-primary)] bg-[var(--r-primary-muted)] text-[var(--r-primary)]"
                              : "border-line text-ink hover:border-ink-faint"
                          )}
                        >
                          <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                          {PAYMENT_METHOD_LABEL[m]}
                          {selected && <Check className="ml-auto h-4 w-4" aria-hidden="true" />}
                        </button>
                      );
                    })}
                  </div>
                </Card>

                <Card className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="type-small text-ink-muted">Subtotal</span>
                    <span className="type-small font-semibold tnum">{formatMoney(aed(subtotal))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="type-small text-ink-muted">VAT (5% incl.)</span>
                    <span className="type-small font-semibold tnum">{formatMoney(aed(tax))}</span>
                  </div>
                  <Divider />
                  <div className="flex justify-between">
                    <span className="text-sm font-bold">Total</span>
                    <span className="text-sm font-bold tnum" data-numeric>{formatMoney(aed(subtotal))}</span>
                  </div>
                  <div className="mt-1 flex flex-col gap-2">
                    <Button size="lg" className="w-full" disabled={items.length === 0} onClick={pay}>
                      Pay {formatMoney(aed(subtotal))}
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={() => setPhase("shop")} leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}>
                      Back to shop
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {phase === "processing" && (
            <Card className="mx-auto flex max-w-md flex-col items-center py-12 text-center" role="status" aria-label="Processing payment">
              <Loader2 className="h-10 w-10 animate-spin text-[var(--r-primary)]" aria-hidden="true" />
              <p className="type-h3 mt-4">
                {procStage === "payment" ? "Confirming payment…" : "Issuing your receipt…"}
              </p>
              <p className="type-small mt-1 text-ink-muted">
                {procStage === "payment"
                  ? `Charging ${formatMoney(aed(subtotal))} via ${PAYMENT_METHOD_LABEL[method]}.`
                  : "Creating the digital receipt on the shared ledger."}
              </p>
            </Card>
          )}

          {phase === "handoff" && receipt && (
            <ReceiveChoice
              receipt={receipt}
              onDone={(_method, wasSaved) => {
                if (wasSaved) setSaved(true);
                setPhase("ready");
              }}
            />
          )}

          {phase === "ready" && receipt && (
            <div className="flex flex-col gap-5">
              <ReceiptReady receipt={receipt} onReset={restart} />
              <Card className="mx-auto w-full max-w-3xl">
                <h2 className="type-h4">Both ends, same receipt</h2>
                <p className="type-small mt-1 text-ink-muted">
                  This sale already lives everywhere — follow it into the other portals.
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Button
                    variant={saved ? "secondary" : "primary"}
                    disabled={saved}
                    onClick={saveToWallet}
                    leftIcon={saved ? <Check className="h-4 w-4" aria-hidden="true" /> : <Wallet className="h-4 w-4" aria-hidden="true" />}
                  >
                    {saved ? "Saved to wallet" : "Save to my wallet"}
                  </Button>
                  <Link href="/customer/wallet">
                    <Button variant="outline" className="w-full">Open customer wallet</Button>
                  </Link>
                  <Link href="/merchant">
                    <Button variant="outline" className="w-full">See it in the merchant portal</Button>
                  </Link>
                  <Link href="/demo/admin">
                    <Button variant="outline" className="w-full">Watch the admin get notified</Button>
                  </Link>
                </div>
                <div className="mt-3 flex justify-center">
                  <Button variant="ghost" size="sm" onClick={restart} leftIcon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}>
                    Start a new shop
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
