"use client";

import { motion } from "framer-motion";
import { CheckCircle2, QrCode, ShieldCheck, Store, Wallet } from "lucide-react";

/**
 * Hero product visual: POS sale -> Receipti -> verified receipt -> wallet.
 * Decorative illustration (single accessible label, inner detail hidden).
 */
export function HeroVisual() {
  // Always the same props on server and client (branching here caused
  // hydration mismatches); MotionProvider disables the transform for
  // reduced-motion users.
  const float = {
    animate: { y: [0, -9, 0] },
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const },
  };

  return (
    <div
      role="img"
      aria-label="Illustration: a store sale flows through Receipti and becomes a verified digital receipt in the customer wallet"
      className="relative mx-auto w-full max-w-sm select-none"
    >
      <div className="bg-blueprint absolute -inset-6 rounded-[2rem] [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_75%)]" aria-hidden="true" />

      <div className="relative flex flex-col items-center" aria-hidden="true">
        {/* Source: POS */}
        <div className="z-10 flex items-center gap-2 rounded-full border border-line bg-[var(--r-card)] px-4 py-2 shadow-subtle">
          <Store className="h-4 w-4 text-[var(--r-primary)]" />
          <span className="text-[0.8125rem] font-semibold">Urban Threads · POS</span>
        </div>

        {/* Connector with flowing pulse */}
        <div className="relative h-24 w-px bg-line">
          <span className="animate-flow-y absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-[var(--r-accent)]" />
        </div>

        {/* Receipti node */}
        <div className="z-10 -my-24 flex items-center gap-2 rounded-full bg-[var(--r-dark)] px-4 py-2 text-[var(--r-on-dark)] shadow-card">
          <span className="h-2 w-2 rounded-full bg-[var(--r-accent)]" />
          <span className="type-status">Receipti</span>
        </div>

        {/* Receipt card */}
        <motion.div {...float} className="z-20 mt-6 w-full">
          <div className="overflow-hidden rounded-2xl border border-line bg-[var(--r-card)] shadow-card">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <div>
                <p className="text-sm font-bold">Urban Threads</p>
                <p className="type-caption text-ink-muted" data-mono>
                  RCPT-DEMO-001
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--r-verified-muted)] px-2.5 py-1 type-status text-[var(--r-verified)]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified
              </span>
            </div>
            <div className="space-y-2 px-5 py-4">
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">2 × Jacket</span>
                <span className="font-semibold tnum">AED 3,000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">Tax (5% incl.)</span>
                <span className="tnum">AED 142.86</span>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-line pt-2.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--r-primary-muted)] px-2.5 py-1 type-status text-[var(--r-primary)]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Paid
                </span>
                <span className="type-amount text-lg tnum">AED 3,000</span>
              </div>
            </div>
            <div className="receipt-edge" />
            <div className="flex items-center justify-between bg-background/70 px-5 py-3">
              <span className="inline-flex items-center gap-1.5 type-caption text-ink-muted">
                <QrCode className="h-4 w-4" />
                Scan to verify
              </span>
              <span className="type-caption text-ink-faint tnum">20 Sep 2026 · 6:24 PM</span>
            </div>
          </div>
        </motion.div>

        {/* Connector */}
        <div className="relative h-16 w-px bg-line">
          <span
            className="animate-flow-y absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-[var(--r-accent)]"
            style={{ animationDelay: "1.3s" }}
          />
        </div>

        {/* Destination: wallet */}
        <div className="z-10 flex items-center gap-2 rounded-full border border-line bg-[var(--r-card)] px-4 py-2 shadow-subtle">
          <Wallet className="h-4 w-4 text-[var(--r-primary)]" />
          <span className="text-[0.8125rem] font-semibold">Customer wallet</span>
        </div>
      </div>
    </div>
  );
}
