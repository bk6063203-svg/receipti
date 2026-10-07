"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import type { CartItem, PosPaymentMethod, PosPaymentStatus, PosReceipt, Product } from "@/types/pos";
import { formatMoney } from "@/lib/format";
import { aed, buildReference, cartCount, cartSubtotalMinor, createReceipt, createTransaction, PAYMENT_METHOD_LABEL } from "@/lib/pos";
import { nextSequence, saveReceipt } from "@/lib/pos-store";
import { pushNotifyEvent } from "@/lib/notify";
import { Button, Modal } from "@/components/ui";
import { useToast } from "@/components/ui";
import { CartPanel } from "./CartPanel";
import { CatalogBrowser } from "./CatalogBrowser";
import { PosHeader } from "./PosHeader";
import { ProcessingOverlay, type ProcessingStage } from "./ProcessingOverlay";
import { ReceiptReady } from "./ReceiptReady";

type Phase = "sale" | "processing" | "ready";

const PAY_DELAY_MS = 1900;
const PAID_PAUSE_MS = 700;
const CREATE_DELAY_MS = 1700;

export function PosApp() {
  const { toast } = useToast();
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = React.useState<PosPaymentMethod>("CARD");
  const [phase, setPhase] = React.useState<Phase>("sale");
  const [stage, setStage] = React.useState<ProcessingStage>("payment");
  const [paymentStatus, setPaymentStatus] = React.useState<PosPaymentStatus>("UNPAID");
  const [receipt, setReceipt] = React.useState<PosReceipt | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [failNext, setFailNext] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState("");
  const timers = React.useRef<number[]>([]);

  const later = React.useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  React.useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  /* ---------- cart actions ---------- */

  const add = React.useCallback((product: Product) => {
    setItems((prev) => {
      const found = prev.find((i) => i.product.id === product.id);
      if (found)
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      return [...prev, { product, quantity: 1 }];
    });
    setError(null);
  }, []);

  const increment = React.useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.product.id === id ? { ...i, quantity: i.quantity + 1 } : i))
    );
  }, []);

  const decrement = React.useCallback(
    (id: string) => {
      const target = items.find((i) => i.product.id === id);
      if (!target) return;
      if (target.quantity <= 1) {
        toast({ title: "Item removed", description: target.product.name, tone: "info" });
        setItems((prev) => prev.filter((i) => i.product.id !== id));
      } else {
        setItems((prev) =>
          prev.map((i) => (i.product.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        );
      }
    },
    [items, toast]
  );

  const remove = React.useCallback(
    (id: string) => {
      const target = items.find((i) => i.product.id === id);
      if (target) toast({ title: "Item removed", description: target.product.name, tone: "info" });
      setItems((prev) => prev.filter((i) => i.product.id !== id));
    },
    [items, toast]
  );

  /* ---------- checkout ---------- */

  const checkout = React.useCallback(() => {
    if (items.length === 0) {
      setError("Cannot complete payment with an empty cart.");
      setAnnouncement("Cannot complete payment with an empty cart.");
      return;
    }
    setError(null);
    setCartOpen(false);
    setPhase("processing");
    setStage("payment");
    setPaymentStatus("PROCESSING");
    setAnnouncement("Processing payment.");

    later(() => {
      if (failNext) {
        setFailNext(false);
        setPhase("sale");
        setPaymentStatus("FAILED");
        setError("Payment could not be completed. Please try again.");
        setAnnouncement("Payment could not be completed. Please try again.");
        return;
      }
      setPaymentStatus("PAID");
      setStage("paid");
      setAnnouncement("Payment successful. Creating digital receipt.");
      later(() => {
        setStage("creating");
        later(() => {
          const seq = nextSequence();
          const tx = createTransaction(items, paymentMethod, seq);
          const rec = createReceipt(tx, seq, buildReference());
          try {
            saveReceipt(rec);
          } catch {
            /* receipt still displays even if storage fails */
          }
          pushNotifyEvent({
            kind: "sale",
            title: `Sale completed · ${formatMoney(aed(rec.totalMinor))}`,
            detail: `${rec.merchant} · ${rec.id} · ${PAYMENT_METHOD_LABEL[paymentMethod]}`,
            href: `/receipt/${rec.reference}`,
          });
          setStage("ready");
          setAnnouncement("Receipti receipt ready.");
          later(() => {
            setReceipt(rec);
            setPhase("ready");
          }, 900);
        }, CREATE_DELAY_MS);
      }, PAID_PAUSE_MS);
    }, PAY_DELAY_MS);
  }, [items, paymentMethod, failNext, later]);

  const reset = React.useCallback(() => {
    clearTimers();
    setItems([]);
    setPaymentMethod("CARD");
    setPhase("sale");
    setStage("payment");
    setPaymentStatus("UNPAID");
    setReceipt(null);
    setError(null);
    setCartOpen(false);
    setAnnouncement("New transaction started.");
  }, []);

  const count = cartCount(items);
  const total = cartSubtotalMinor(items);

  const cart = (
    <CartPanel
      items={items}
      paymentStatus={paymentStatus}
      paymentMethod={paymentMethod}
      onMethodChange={setPaymentMethod}
      onIncrement={increment}
      onDecrement={decrement}
      onRemove={remove}
      onCheckout={checkout}
      error={error}
    />
  );

  return (
    <div className="flex flex-col gap-5">
      <div aria-live="polite" role="status" className="sr-only">
        {announcement}
      </div>

      <div className="pos-no-print">
        <PosHeader />
        <details className="mt-3 text-sm">
          <summary className="type-caption cursor-pointer text-ink-faint hover:text-ink-muted">
            Demo options
          </summary>
          <label className="mt-2 flex cursor-pointer items-center gap-2.5 rounded-xl border border-dashed border-line bg-[var(--r-card)] px-3.5 py-2.5 text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={failNext}
              onChange={(e) => setFailNext(e.target.checked)}
              className="h-4 w-4 accent-[#087F5B]"
            />
            Simulate payment failure on next checkout
          </label>
        </details>
      </div>

      {phase === "ready" && receipt ? (
        <ReceiptReady receipt={receipt} onReset={reset} />
      ) : (
        <>
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
            <CatalogBrowser onAdd={add} />
            <div className="pos-no-print hidden lg:sticky lg:top-24 lg:block">
              <div className="max-h-[calc(100dvh-8rem)] overflow-y-auto">{cart}</div>
            </div>
          </div>

          {/* Mobile sticky cart bar */}
          <div className="pos-no-print sticky bottom-4 z-30 lg:hidden">
            <Button
              size="lg"
              className="w-full shadow-pop"
              onClick={() => setCartOpen(true)}
              leftIcon={<ShoppingCart className="h-5 w-5" aria-hidden="true" />}
              aria-label={`Open cart, ${count} items, total ${formatMoney(aed(total))}`}
            >
              View cart · {count} {count === 1 ? "item" : "items"} · {formatMoney(aed(total))}
            </Button>
          </div>

          <Modal
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            title="Current sale"
            description="Review items and complete the simulated payment."
            size="lg"
          >
            {cart}
          </Modal>
        </>
      )}

      <AnimatePresence>{phase === "processing" && <ProcessingOverlay stage={stage} totalMinor={total} />}</AnimatePresence>
    </div>
  );
}
