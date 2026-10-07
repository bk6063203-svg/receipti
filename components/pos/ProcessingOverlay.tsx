"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, ReceiptText } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { aed } from "@/lib/pos";
import { cn } from "@/lib/utils";

export type ProcessingStage = "payment" | "paid" | "creating" | "ready";

const STEPS = [
  { id: "payment", label: "Processing payment" },
  { id: "receipt", label: "Creating digital receipt" },
] as const;

function stepState(stage: ProcessingStage, step: "payment" | "receipt"): "done" | "active" | "idle" {
  if (step === "payment") return stage === "payment" ? "active" : "done";
  if (stage === "payment" || stage === "paid") return "idle";
  return stage === "creating" ? "active" : "done";
}

/** Full-screen staged transition: POS transaction → Receipti receipt. */
export function ProcessingOverlay({ stage, totalMinor }: { stage: ProcessingStage; totalMinor: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="status"
      aria-live="polite"
      aria-label={
        stage === "payment"
          ? "Processing payment"
          : stage === "creating"
            ? "Payment successful. Creating digital receipt."
            : "Receipti receipt ready"
      }
    >
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-[var(--r-card)] p-6 text-center shadow-pop">
        <AnimatePresence mode="wait">
          {stage === "ready" ? (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
            >
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--r-primary)] text-white">
                <ReceiptText className="h-7 w-7" aria-hidden="true" />
              </span>
              <p className="type-h3 mt-4">Receipti receipt ready</p>
              <p className="type-small mt-1 text-ink-muted">Handing off to the customer…</p>
            </motion.div>
          ) : (
            <motion.div key="progress" exit={{ opacity: 0, scale: 0.97 }}>
              <p className="type-label text-ink-faint">Total due</p>
              <p className="type-amount mt-1 text-3xl tnum" data-numeric>
                {formatMoney(aed(totalMinor))}
              </p>
              <ol className="mt-6 space-y-3 text-left">
                {STEPS.map((s) => {
                  const state = stepState(stage, s.id);
                  return (
                    <li
                      key={s.id}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-4 py-3",
                        state === "idle" ? "border-line opacity-50" : "border-[var(--r-primary)] bg-[var(--r-primary-muted)]/40"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                          state === "done"
                            ? "bg-[var(--r-primary)] text-white"
                            : state === "active"
                              ? "bg-[var(--r-card)] text-[var(--r-primary)]"
                              : "bg-background text-ink-faint"
                        )}
                      >
                        {state === "done" ? (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        ) : state === "active" ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
                        )}
                      </span>
                      <span className="text-sm font-semibold">
                        {s.label}
                        {state === "active" && <span aria-hidden="true">…</span>}
                        {state === "done" && s.id === "payment" && (
                          <span className="mt-0.5 block text-[0.8125rem] font-medium text-[var(--r-primary)]">
                            ✓ Payment successful
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ol>
              <p className="type-caption mt-4 text-ink-faint">Simulated — no real payment is processed.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
