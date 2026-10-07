"use client";

import { motion } from "framer-motion";
import {
  Database,
  FileCheck2,
  Plug,
  ReceiptText,
  Smartphone,
  Store,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useReducedMotion } from "@/lib/motion";
import { Card } from "@/components/ui";
import { FadeIn } from "@/components/merchant";
import { useMounted } from "@/hooks/use-mounted";

interface FlowNode {
  icon: LucideIcon;
  title: string;
  business: string;
  dev: string;
  accent?: boolean;
}

const NODES: FlowNode[] = [
  { icon: Store, title: "Merchant POS / ERP", business: "The sale happens here, as usual", dev: "existing system" },
  { icon: ReceiptText, title: "Transaction created", business: "Payment completes at checkout", dev: "TXN id assigned" },
  { icon: Plug, title: "Receipti API / webhook", business: "Permitted receipt data is sent", dev: "POST /v1/receipts", accent: true },
  { icon: Database, title: "Receipti", business: "The trusted record is stored", dev: "idempotency checked" },
  { icon: FileCheck2, title: "Receipt record created", business: "A verifiable receipt exists", dev: "RCPT id issued" },
  { icon: Smartphone, title: "Customer receipt", business: "QR, wallet, or web access", dev: "/receipt/[id]" },
  { icon: Wallet, title: "Receipti wallet", business: "Saved for returns & records", dev: "customer-owned" },
];

/** The POS → Receipti → customer story, readable by owners and developers. */
export function IntegrationFlow() {
  const reduce = useReducedMotion();
  const mounted = useMounted();
  // Render the pulse on the server AND first client render so hydration
  // matches; remove it after mount for reduced-motion users (the pulse
  // animates `top`, which MotionProvider does not disable).
  const showPulse = mounted ? !reduce : true;
  return (
    <Card as="section" aria-label="How integration works" className="overflow-hidden">
      <p className="type-label text-center text-[var(--r-primary)]">How it connects</p>
      <h2 className="type-h3 mt-1 text-center">From checkout to customer receipt</h2>
      <FadeIn delay={0.05}>
      <ol className="relative mx-auto mt-6 flex max-w-xl flex-col" aria-label="Integration flow steps">
        {/* connector line */}
        <span aria-hidden="true" className="absolute bottom-8 left-[1.6875rem] top-8 w-0.5 bg-line" />
        {showPulse && (
          <motion.span
            aria-hidden="true"
            className="absolute left-[1.6875rem] h-10 w-0.5 -translate-x-0 rounded-full bg-[var(--r-primary)]"
            initial={{ top: "2rem", opacity: 0 }}
            animate={{ top: ["2rem", "calc(100% - 4.5rem)"], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
          />
        )}
        {NODES.map((n, i) => {
          const Icon = n.icon;
          return (
              <li key={n.title} className="relative flex items-start gap-4 pb-5 last:pb-0">
                <span
                  aria-hidden="true"
                  className={
                    n.accent
                      ? "z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--r-primary)] text-white shadow-card"
                      : "z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-line bg-[var(--r-card)] text-[var(--r-primary)]"
                  }
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1 rounded-2xl border border-line bg-background/50 px-4 py-3">
                  <span className="block text-sm font-bold">
                    <span className="sr-only">Step {i + 1}: </span>
                    {n.title}
                  </span>
                  <span className="type-small mt-0.5 block text-ink-muted">{n.business}</span>
                  <span className="type-caption mt-1 block text-ink-faint" data-mono>
                    {n.dev}
                  </span>
                </span>
              </li>
          );
        })}
      </ol>
      </FadeIn>
      <p className="type-caption mx-auto mt-5 max-w-xl text-center text-ink-faint">
        Your POS stays the system of record — Receipti only receives the receipt data it
        is permitted to hold.
      </p>
    </Card>
  );
}
