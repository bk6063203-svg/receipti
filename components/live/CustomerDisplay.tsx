"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Radio, Store } from "lucide-react";
import { LIVE_BRANCH, LIVE_MERCHANT } from "@/data/live-catalog";
import { formatDateTime, formatMoney } from "@/lib/format";
import { liveDiscountLabel, pkr } from "@/lib/live-transaction";
import { useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useLive } from "./LiveProvider";
import { LiveHandoff } from "./LiveHandoff";
import { ProductThumb } from "./ProductThumb";
import { SyncBadge } from "./SyncBadge";

/** Lines touched within this window glow as "just scanned". */
const FRESH_MS = 3500;

export function CustomerDisplay() {
  const reduce = useReducedMotion();
  const { tx, totals } = useLive();
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const paid = tx.status === "paid";
  const ready = tx.status === "ready";
  const empty = tx.lines.length === 0;

  const statusLabel = paid ? "Paid" : ready ? "Bill ready" : "In progress";

  return (
    <div
      className="overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950 text-white shadow-card"
      role="region"
      aria-label="Customer checkout display (read-only)"
    >
      {/* Masthead */}
      <div className="flex items-center gap-3 border-b border-neutral-800 bg-neutral-900/60 px-5 py-4 sm:px-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-800 text-emerald-300" aria-hidden="true">
          <Store className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold tracking-tight sm:text-lg">{LIVE_MERCHANT}</p>
          <p className="truncate text-xs text-neutral-400">{LIVE_BRANCH}</p>
        </div>
        <span
          className={cn(
            "hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-bold sm:inline-flex",
            paid
              ? "bg-emerald-500/15 text-emerald-300"
              : ready
                ? "bg-amber-500/15 text-amber-300"
                : "bg-neutral-800 text-neutral-300"
          )}
        >
          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
            {!paid && !reduce && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
            )}
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
          </span>
          {statusLabel}
        </span>
        <div className="shrink-0 text-right">
          <p className="font-mono text-sm font-semibold text-emerald-300" data-mono>{tx.id}</p>
          <p className="mt-0.5 text-[0.6875rem] text-neutral-500 tnum">{formatDateTime(tx.createdAt)}</p>
        </div>
      </div>

      {paid ? (
        <div className="flex flex-col">
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center px-6 pb-2 pt-8 text-center"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-neutral-950">
              <BadgeCheck className="h-8 w-8" aria-hidden="true" />
            </span>
            <p className="mt-3 text-2xl font-bold tracking-tight">Payment Confirmed (Demo)</p>
            <p className="mt-1 font-mono text-3xl font-semibold text-emerald-300 tnum" data-numeric>
              {formatMoney(pkr(totals.totalMinor))}
            </p>
            <p className="mt-2 text-sm text-neutral-400">
              {totals.count} item{totals.count === 1 ? "" : "s"} · {tx.id}
            </p>
          </motion.div>
          <LiveHandoff />
        </div>
      ) : ready ? (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center px-5 py-8 text-center sm:px-6"
          aria-live="polite"
        >
          <p className="text-2xl font-bold tracking-tight">Your bill is ready.</p>
          <p className="mt-1 max-w-xs text-sm text-neutral-400">
            {totals.count} item{totals.count === 1 ? "" : "s"} · please pay{" "}
            <span className="font-mono font-semibold text-emerald-300 tnum">
              {formatMoney(pkr(totals.totalMinor))}
            </span>
          </p>
          <ul className="mt-5 flex max-h-56 w-full flex-col gap-1.5 overflow-y-auto" aria-label="Final bill">
            {tx.lines.map((l) => (
              <li
                key={l.sku}
                className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/50 px-3.5 py-2.5 text-left"
              >
                <ProductThumb image={l.image} name={l.name} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{l.name}</p>
                  <p className="text-xs text-neutral-500 tnum">
                    {l.size} · {l.colour} · {l.quantity} × {formatMoney(pkr(l.unitMinor))}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-sm font-semibold tnum">
                  {formatMoney(pkr(l.unitMinor * l.quantity))}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 flex w-full flex-col gap-1 border-t border-neutral-800 pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-400">Subtotal</dt>
              <dd className="font-semibold tnum">{formatMoney(pkr(totals.subtotalMinor))}</dd>
            </div>
            {totals.discountMinor > 0 && (
              <div className="flex justify-between">
                <dt className="text-neutral-400">Discount ({liveDiscountLabel(tx.discount)})</dt>
                <dd className="font-semibold text-emerald-300 tnum">
                  −{formatMoney(pkr(totals.discountMinor))}
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-neutral-400">Sales tax ({tx.taxPct}%)</dt>
              <dd className="font-semibold tnum">{formatMoney(pkr(totals.taxMinor))}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-neutral-500">
            Your cashier is completing payment…
          </p>
        </motion.div>
      ) : empty ? (
        <div className="flex flex-col items-center px-6 py-12 text-center sm:py-16">
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-neutral-900 text-neutral-500">
            <Radio className="h-8 w-8" aria-hidden="true" />
          </span>
          <p className="mt-4 text-xl font-bold tracking-tight">Welcome to {LIVE_MERCHANT}</p>
          <p className="mt-2 max-w-xs text-sm text-neutral-400">
            Your cashier is starting a new bill — items will appear here the moment they are scanned.
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto px-5 py-4 sm:px-6" aria-label="Scanned items" aria-live="polite">
            <AnimatePresence initial={false}>
              {tx.lines.map((l) => {
                const fresh = now - l.updatedAt < FRESH_MS;
                return (
                  <motion.li
                    key={l.sku}
                    layout={!reduce}
                    initial={reduce ? false : { opacity: 0, y: -8, backgroundColor: "rgba(52,211,153,0.18)" }}
                    animate={{ opacity: 1, y: 0, backgroundColor: fresh ? "rgba(52,211,153,0.10)" : "rgba(52,211,153,0)" }}
                    exit={reduce ? undefined : { opacity: 0, x: 24 }}
                    transition={{ duration: 0.22 }}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border px-3.5 py-3",
                      fresh ? "border-emerald-500/40" : "border-neutral-800 bg-neutral-900/50"
                    )}
                  >
                    <ProductThumb image={l.image} name={l.name} size={48} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold sm:text-[0.9375rem]">{l.name}</p>
                      <p className="mt-0.5 truncate text-xs text-neutral-400">
                        Size {l.size} · {l.colour}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500 tnum">
                        {l.quantity} × {formatMoney(pkr(l.unitMinor))}
                      </p>
                    </div>
                    {fresh && (
                      <span className="hidden shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[0.6875rem] font-bold text-emerald-300 sm:inline">
                        Just scanned
                      </span>
                    )}
                    <span className="shrink-0 font-mono text-sm font-semibold tnum sm:text-base" data-numeric>
                      {formatMoney(pkr(l.unitMinor * l.quantity))}
                    </span>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          <div className="border-t border-neutral-800 bg-neutral-900/60 px-5 py-4 sm:px-6">
            <dl className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <dt className="text-neutral-400">Subtotal ({totals.count} item{totals.count === 1 ? "" : "s"})</dt>
                <dd className="font-semibold tnum">{formatMoney(pkr(totals.subtotalMinor))}</dd>
              </div>
              {totals.discountMinor > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <dt className="text-neutral-400">Discount ({liveDiscountLabel(tx.discount)})</dt>
                    <dd className="font-semibold text-emerald-300 tnum">
                      −{formatMoney(pkr(totals.discountMinor))}
                    </dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-neutral-400">Amount before tax</dt>
                    <dd className="font-semibold tnum">{formatMoney(pkr(totals.netMinor))}</dd>
                  </div>
                </>
              )}
              <div className="flex justify-between text-sm">
                <dt className="text-neutral-400">Sales tax ({tx.taxPct}%)</dt>
                <dd className="font-semibold tnum">{formatMoney(pkr(totals.taxMinor))}</dd>
              </div>
            </dl>
            <div className="mt-3 flex items-end justify-between gap-3 border-t border-neutral-800 pt-3">
              <p className="pb-1 text-sm font-bold tracking-wide text-neutral-300">PAYABLE</p>
              <motion.p
                key={totals.totalMinor}
                initial={reduce ? false : { scale: 1.07 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.25 }}
                className="font-mono text-3xl font-semibold text-emerald-300 tnum sm:text-4xl"
                data-numeric
                aria-live="polite"
              >
                {formatMoney(pkr(totals.totalMinor))}
              </motion.p>
            </div>
          </div>
        </div>
      )}

      {/* Read-only footer */}
      <div className="flex items-center justify-between gap-3 border-t border-neutral-800 px-5 py-3 sm:px-6">
        <p className="text-[0.6875rem] font-semibold tracking-wide text-neutral-500">
          CUSTOMER DISPLAY · READ-ONLY
        </p>
        <SyncBadge dark />
      </div>
    </div>
  );
}
