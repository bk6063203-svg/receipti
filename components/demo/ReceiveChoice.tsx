"use client";

import * as React from "react";
import QRCode from "react-qr-code";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Link2,
  Nfc,
  Printer,
  QrCode,
} from "lucide-react";
import type { PosReceipt } from "@/types/pos";
import { formatDateTime, formatMoney } from "@/lib/format";
import { aed, PAYMENT_METHOD_LABEL } from "@/lib/pos";
import { setReceiptSaved } from "@/lib/wallet-store";
import { Badge, Button, Card, useToast } from "@/components/ui";
import { useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type HandoffMethod = "qr" | "tap" | "print" | "skip";

type View = "choose" | "qr" | "tap" | "tap-done" | "print";

const HOLD_MS = 1100;
const RING_C = 2 * Math.PI * 70;

export function ReceiveChoice({
  receipt,
  onDone,
}: {
  receipt: PosReceipt;
  /** Fired when the customer continues to the receipt. `saved` is true when tap-to-receive stored it. */
  onDone: (method: HandoffMethod, saved: boolean) => void;
}) {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [view, setView] = React.useState<View>("choose");
  const [saved, setSaved] = React.useState(false);
  const [origin, setOrigin] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [holding, setHolding] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const raf = React.useRef(0);
  const doneRef = React.useRef(false);

  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  React.useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const receiptUrl = origin ? `${origin}/receipt/${receipt.reference}` : `/receipt/${receipt.reference}`;

  const finish = (method: HandoffMethod) => onDone(method, saved);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(receiptUrl);
      setCopied(true);
      toast({ title: "Receipt link copied", description: receipt.reference, tone: "success" });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Select and copy the link manually.", tone: "error" });
    }
  };

  const print = () => {
    document.body.classList.add("slip-print");
    const done = () => {
      document.body.classList.remove("slip-print");
      window.removeEventListener("afterprint", done);
    };
    window.addEventListener("afterprint", done);
    window.print();
    window.setTimeout(() => document.body.classList.remove("slip-print"), 1000);
  };

  /* ---------- tap-to-receive: press-and-hold with progress ring ---------- */

  const completeTap = React.useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    cancelAnimationFrame(raf.current);
    setHolding(false);
    setProgress(1);
    try {
      setReceiptSaved(receipt.reference, true);
    } catch {
      /* wallet save is best-effort */
    }
    setSaved(true);
    setView("tap-done");
    toast({ title: "Receipt received", description: "Saved straight to the customer wallet.", tone: "success" });
  }, [receipt.reference, toast]);

  const runHold = () => {
    if (doneRef.current || view !== "tap") return;
    if (reduce) {
      completeTap();
      return;
    }
    cancelAnimationFrame(raf.current);
    setHolding(true);
    const t0 = performance.now();
    const tick = (t: number) => {
      if (doneRef.current) return;
      const p = Math.min(1, (t - t0) / HOLD_MS);
      setProgress(p);
      if (p >= 1) completeTap();
      else raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  const cancelHold = () => {
    if (doneRef.current) return;
    cancelAnimationFrame(raf.current);
    setHolding(false);
    setProgress(0);
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      {view === "choose" && (
        <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex flex-col gap-5">
          <div className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--r-verified)] text-white">
              <Check className="h-7 w-7" aria-hidden="true" />
            </span>
            <h2 className="type-h1 mt-4">Payment approved</h2>
            <p className="type-body mt-1.5 text-ink-muted tnum">
              {formatMoney(aed(receipt.totalMinor))} paid via {PAYMENT_METHOD_LABEL[receipt.paymentMethod]} · Receipt {receipt.id}
            </p>
          </div>

          <Card>
            <h3 className="type-h3 text-center">How would you like your receipt?</h3>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setView("qr")}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-line px-4 py-6 text-center transition-colors hover:border-[var(--r-primary)] hover:bg-[var(--r-primary-muted)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--r-primary-muted)] text-[var(--r-primary)]">
                  <QrCode className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="text-sm font-bold">Show QR code</span>
                <span className="type-caption text-ink-muted">Scan with any phone camera to open it</span>
              </button>
              <button
                type="button"
                onClick={() => setView("tap")}
                className="group relative flex flex-col items-center gap-2 rounded-2xl border border-line px-4 py-6 text-center transition-colors hover:border-[var(--r-primary)] hover:bg-[var(--r-primary-muted)]"
              >
                <Badge tone="success" className="absolute right-2.5 top-2.5">Fastest</Badge>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--r-primary-muted)] text-[var(--r-primary)]">
                  <Nfc className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="text-sm font-bold">Tap to receive</span>
                <span className="type-caption text-ink-muted">Hold the phone near — straight into the wallet</span>
              </button>
              <button
                type="button"
                onClick={() => setView("print")}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-line px-4 py-6 text-center transition-colors hover:border-[var(--r-primary)] hover:bg-[var(--r-primary-muted)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--r-primary-muted)] text-[var(--r-primary)]">
                  <Printer className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="text-sm font-bold">Print a slip</span>
                <span className="type-caption text-ink-muted">Paper receipt from the counter printer</span>
              </button>
            </div>
          </Card>

          <div className="flex justify-center">
            <Button variant="ghost" size="sm" onClick={() => finish("skip")}>
              Skip — show my receipt
            </Button>
          </div>
        </motion.div>
      )}

      {view === "qr" && (
        <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex flex-col items-center gap-4">
          <div className="text-center">
            <h2 className="type-h2">Scan to receive</h2>
            <p className="type-small mt-1 text-ink-muted">Point any phone camera at the code — the receipt opens instantly.</p>
          </div>
          <div className="rounded-3xl border border-line bg-white p-6 shadow-card">
            <QRCode value={receiptUrl} size={208} aria-label={`QR code for receipt ${receipt.reference}`} />
          </div>
          <p className="type-small text-ink-muted tnum" data-mono>{receipt.reference}</p>
          <div className="flex w-full max-w-sm flex-col gap-2">
            <Button variant="outline" className="w-full" onClick={copyLink} leftIcon={copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}>
              {copied ? "Link copied" : "Copy receipt link"}
            </Button>
            <Button className="w-full" size="lg" onClick={() => finish("qr")}>
              Continue to receipt
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setView("choose")} leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}>
              Choose another way
            </Button>
          </div>
        </motion.div>
      )}

      {view === "tap" && (
        <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Card className="mx-auto flex max-w-md flex-col items-center py-10 text-center">
            <h2 className="type-h2">Tap to receive</h2>
            <p className="type-small mt-1 text-ink-muted">
              Press and hold — or just tap — to simulate the phone tap.
            </p>
            <div className="relative mt-6">
              {!reduce && (
                <>
                  <span className="absolute inset-0 animate-ping rounded-full bg-[var(--r-primary-muted)]" aria-hidden="true" />
                  <span className="absolute -inset-3 rounded-full border-2 border-dashed border-line" aria-hidden="true" />
                </>
              )}
              <svg width="176" height="176" viewBox="0 0 176 176" className="absolute inset-0 -rotate-90" aria-hidden="true">
                <circle cx="88" cy="88" r="70" fill="none" strokeWidth="6" className="stroke-[var(--r-line)]" />
                <circle
                  cx="88"
                  cy="88"
                  r="70"
                  fill="none"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={RING_C}
                  strokeDashoffset={RING_C * (1 - progress)}
                  className="stroke-[var(--r-primary)]"
                />
              </svg>
              <button
                type="button"
                onPointerDown={runHold}
                onPointerUp={cancelHold}
                onPointerLeave={cancelHold}
                onClick={runHold}
                aria-label="Press and hold to receive the receipt by tap"
                className={cn(
                  "relative flex h-44 w-44 touch-none select-none items-center justify-center rounded-full transition-colors",
                  holding ? "bg-[var(--r-primary)] text-white" : "bg-[var(--r-primary-muted)] text-[var(--r-primary)]"
                )}
              >
                <Nfc className="h-16 w-16" aria-hidden="true" />
              </button>
            </div>
            <p className="type-small mt-6 font-semibold tnum" role="status" aria-live="polite">
              {holding ? `Receiving… ${Math.round(progress * 100)}%` : "Waiting for tap"}
            </p>
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => { cancelHold(); setView("choose"); }} leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}>
              Choose another way
            </Button>
          </Card>
        </motion.div>
      )}

      {view === "tap-done" && (
        <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Card className="mx-auto flex max-w-md flex-col items-center py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--r-verified)] text-white">
              <Check className="h-7 w-7" aria-hidden="true" />
            </span>
            <h2 className="type-h2 mt-4">Receipt received</h2>
            <p className="type-small mt-1.5 text-ink-muted">
              {receipt.id} · {formatMoney(aed(receipt.totalMinor))} saved to the wallet —
              ready for returns and records.
            </p>
            <div className="mt-5 flex w-full max-w-xs flex-col gap-2">
              <Button className="w-full" size="lg" onClick={() => finish("tap")}>
                Continue to receipt
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {view === "print" && (
        <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex flex-col items-center gap-4">
          <div className="slip-no-print text-center">
            <h2 className="type-h2">Print a slip</h2>
            <p className="type-small mt-1 text-ink-muted">Preview of the counter print — only the slip goes to the printer.</p>
          </div>

          {/* Paper slip: the only thing that prints */}
          <div className="w-full max-w-75 bg-white px-6 py-7 font-mono text-[0.8125rem] leading-relaxed text-neutral-900 shadow-card" aria-label="Paper receipt preview">
            <div className="text-center">
              <p className="text-base font-bold tracking-wide">{receipt.merchant.toUpperCase()}</p>
              <p className="text-neutral-600">{receipt.branch}</p>
              <p className="mt-1 text-neutral-600 tnum">{formatDateTime(receipt.issuedAt)}</p>
            </div>
            <div className="my-3 border-t border-dashed border-neutral-400" aria-hidden="true" />
            <ul className="flex flex-col gap-1.5">
              {receipt.lines.map((l) => (
                <li key={l.sku}>
                  <p className="font-bold">{l.name}</p>
                  <p className="flex justify-between text-neutral-700 tnum">
                    <span>{l.quantity} × {formatMoney(aed(l.unitMinor))}</span>
                    <span>{formatMoney(aed(l.lineMinor))}</span>
                  </p>
                </li>
              ))}
            </ul>
            <div className="my-3 border-t border-dashed border-neutral-400" aria-hidden="true" />
            <dl className="tnum">
              <div className="flex justify-between">
                <dt className="text-neutral-700">Subtotal</dt>
                <dd>{formatMoney(aed(receipt.subtotalMinor))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-700">VAT (5% incl.)</dt>
                <dd>{formatMoney(aed(receipt.taxMinor))}</dd>
              </div>
              <div className="mt-1 flex justify-between border-t border-neutral-900 pt-1 text-sm font-bold">
                <dt>TOTAL</dt>
                <dd>{formatMoney(aed(receipt.totalMinor))}</dd>
              </div>
            </dl>
            <div className="my-3 border-t border-dashed border-neutral-400" aria-hidden="true" />
            <dl className="tnum">
              <div className="flex justify-between">
                <dt className="text-neutral-700">Paid</dt>
                <dd>{PAYMENT_METHOD_LABEL[receipt.paymentMethod]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-700">Receipt</dt>
                <dd>{receipt.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-700">Ref</dt>
                <dd>{receipt.reference}</dd>
              </div>
            </dl>
            <p className="mt-3 text-center text-neutral-600">Digital copy: /receipt/{receipt.reference}</p>
            <p className="mt-1 text-center font-bold">Thank you for shopping!</p>
          </div>

          <div className="slip-no-print flex w-full max-w-sm flex-col gap-2">
            <Button variant="outline" className="w-full" onClick={print} leftIcon={<Printer className="h-4 w-4" aria-hidden="true" />}>
              Print now
            </Button>
            <Button className="w-full" size="lg" onClick={() => finish("print")}>
              Continue to receipt
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setView("choose")} leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}>
              Choose another way
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
