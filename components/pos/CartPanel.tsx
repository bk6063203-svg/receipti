"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Smartphone,
  Trash2,
} from "lucide-react";
import type { CartItem, PosPaymentMethod, PosPaymentStatus } from "@/types/pos";
import { formatMoney } from "@/lib/format";
import { aed, cartCount, cartSubtotalMinor, inclusiveTaxMinor } from "@/lib/pos";
import { Button, Card, Divider, EmptyState, IconButton } from "@/components/ui";
import { cn } from "@/lib/utils";

const METHODS: { id: PosPaymentMethod; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "CARD", label: "Card", icon: CreditCard },
  { id: "CASH", label: "Cash", icon: Banknote },
  { id: "DIGITAL", label: "Digital payment", icon: Smartphone },
];

export function PaymentPill({ status }: { status: PosPaymentStatus }) {
  if (status === "PAID")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--r-primary-muted)] px-2.5 py-1 type-status text-[var(--r-primary)]">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Paid
      </span>
    );
  if (status === "PROCESSING")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--r-info-muted)] px-2.5 py-1 type-status text-[var(--r-info)]">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Processing
      </span>
    );
  if (status === "FAILED")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--r-danger-muted)] px-2.5 py-1 type-status text-[var(--r-danger)]">
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" /> Failed
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--r-neutral-muted)] px-2.5 py-1 type-status text-ink-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-ink-faint" aria-hidden="true" /> Unpaid
    </span>
  );
}

export interface CartPanelProps {
  items: CartItem[];
  paymentStatus: PosPaymentStatus;
  paymentMethod: PosPaymentMethod;
  onMethodChange: (m: PosPaymentMethod) => void;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  error: string | null;
}

export function CartPanel({
  items,
  paymentStatus,
  paymentMethod,
  onMethodChange,
  onIncrement,
  onDecrement,
  onRemove,
  onCheckout,
  error,
}: CartPanelProps) {
  const count = cartCount(items);
  const subtotal = cartSubtotalMinor(items);
  const tax = inclusiveTaxMinor(subtotal);
  const busy = paymentStatus === "PROCESSING";
  const empty = items.length === 0;

  return (
    <Card as="section" aria-label="Current transaction" padding="none" className="flex min-h-0 flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="flex items-center gap-2 text-[0.9375rem] font-semibold">
          <ShoppingCart className="h-4 w-4 text-ink-muted" aria-hidden="true" />
          Current sale
          {count > 0 && (
            <span className="rounded-full bg-background px-2 py-0.5 type-caption font-semibold text-ink-muted tnum">
              {count} {count === 1 ? "item" : "items"}
            </span>
          )}
        </h2>
        <PaymentPill status={paymentStatus} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {empty ? (
          <EmptyState
            icon={<ShoppingCart className="h-6 w-6" aria-hidden="true" />}
            title="Cart is empty"
            description="Add products from the catalog to start a sale."
            className="border-0 bg-transparent py-8"
          />
        ) : (
          <ul className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {items.map(({ product, quantity }) => (
                <motion.li
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-3 rounded-xl border border-line p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{product.name}</p>
                    <p className="type-caption mt-0.5 text-ink-muted tnum">
                      {quantity} × {formatMoney(product.price)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1" role="group" aria-label={`Quantity for ${product.name}`}>
                    <IconButton
                      label={`Decrease quantity of ${product.name}`}
                      size="sm"
                      variant="outline"
                      onClick={() => onDecrement(product.id)}
                      disabled={busy}
                    >
                      <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                    </IconButton>
                    <span className="w-7 text-center text-sm font-bold tnum" aria-label={`Quantity: ${quantity}`}>
                      {quantity}
                    </span>
                    <IconButton
                      label={`Increase quantity of ${product.name}`}
                      size="sm"
                      variant="outline"
                      onClick={() => onIncrement(product.id)}
                      disabled={busy}
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    </IconButton>
                  </div>
                  <p className="type-small hidden w-20 shrink-0 text-right font-semibold tnum sm:block" data-numeric>
                    {formatMoney(aed(product.price.amountMinor * quantity))}
                  </p>
                  <IconButton
                    label={`Remove ${product.name} from cart`}
                    size="sm"
                    onClick={() => onRemove(product.id)}
                    disabled={busy}
                    className="hover:bg-[var(--r-danger-muted)] hover:text-[var(--r-danger)]"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </IconButton>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <div className="border-t border-line px-5 py-4">
        <dl className="space-y-1.5">
          <div className="flex justify-between">
            <dt className="type-small text-ink-muted">Subtotal</dt>
            <dd className="type-small tnum" data-numeric>{formatMoney(aed(subtotal))}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="type-small text-ink-muted">Discount</dt>
            <dd className="type-small tnum" data-numeric>{formatMoney(aed(0))}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="type-small text-ink-muted">Tax (5% incl.)</dt>
            <dd className="type-small tnum" data-numeric>{formatMoney(aed(tax))}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-line pt-2">
            <dt className="type-small font-semibold">Total</dt>
            <dd className="type-amount text-xl tnum" data-numeric>{formatMoney(aed(subtotal))}</dd>
          </div>
        </dl>

        <fieldset className="mt-4" disabled={busy || empty}>
          <legend className="type-label text-ink-muted">Payment method</legend>
          <div className="mt-2 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Payment method">
            {METHODS.map((m) => {
              const selected = paymentMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onMethodChange(m.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-[0.8125rem] font-medium transition-all",
                    selected
                      ? "border-[var(--r-primary)] bg-[var(--r-primary-muted)]/60 text-ink"
                      : "border-line bg-[var(--r-card)] text-ink-muted hover:border-ink-faint hover:text-ink",
                    "disabled:opacity-50"
                  )}
                >
                  <m.icon className={cn("h-5 w-5", selected ? "text-[var(--r-primary)]" : "text-ink-faint")} aria-hidden="true" />
                  {m.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {error && (
          <p role="alert" className="mt-3 flex items-start gap-2 rounded-xl bg-[var(--r-danger-muted)] px-3.5 py-2.5 text-sm font-medium text-[var(--r-danger)]">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        <Button
          size="lg"
          className="mt-4 w-full"
          onClick={onCheckout}
          loading={busy}
          disabled={empty}
        >
          {paymentStatus === "FAILED" ? "Retry payment" : "Complete Payment"}
        </Button>
        <p className="type-caption mt-2.5 text-center text-ink-faint">
          Simulated checkout — no real payment is processed.
        </p>
      </div>
    </Card>
  );
}
