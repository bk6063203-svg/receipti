"use client";

import * as React from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Loader2,
  Nfc,
  QrCode,
  Wallet,
} from "lucide-react";
import { formatMoney } from "@/lib/format";
import { LIVE_CLAIM_LABEL, pkr } from "@/lib/live-transaction";
import { useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useLive } from "./LiveProvider";

type View = "choose" | "qr" | "nfc" | "wallet";

const HOLD_MS = 1100;
const RING_C = 2 * Math.PI * 70;

/**
 * Post-payment receipt handoff on the customer display. All three paths claim
 * the SAME finalized receipt — the first completed claim wins, and the
 * merchant sees exactly how the customer took it.
 */
export function LiveHandoff() {
  const reduce = useReducedMotion();
  const { tx, totals, claimReceipt } = useLive();
  const [view, setView] = React.useState<View>("choose");
  const [origin, setOrigin] = React.useState("");
  const [holding, setHolding] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [connecting, setConnecting] = React.useState(false);
  const raf = React.useRef(0);
  const timers = React.useRef<number[]>([]);

  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  React.useEffect(() => {
    const list = timers.current;
    return () => {
      cancelAnimationFrame(raf.current);
      list.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const receipt = tx.receipt;
  const claimed = !!receipt?.claimedAt;
  const claimUrl = receipt
    ? origin
      ? `${origin}/live/receipt/${receipt.claimToken}`
      : `/live/receipt/${receipt.claimToken}`
    : "";

  if (!receipt) return null;

  /* ---------- simulated NFC tap: press-and-hold with progress ring ---------- */

  const completeTap = () => {
    cancelAnimationFrame(raf.current);
    setHolding(false);
    setProgress(1);
    claimReceipt("nfc");
  };

  const runHold = () => {
    if (claimed) return;
    if (reduce) {
      completeTap();
      return;
    }
    cancelAnimationFrame(raf.current);
    setHolding(true);
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / HOLD_MS);
      setProgress(p);
      if (p >= 1) completeTap();
      else raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  const cancelHold = () => {
    cancelAnimationFrame(raf.current);
    setHolding(false);
    setProgress(0);
  };

  const saveToWallet = () => {
    if (claimed || connecting) return;
    setConnecting(true);
    timers.current.push(
      window.setTimeout(
        () => {
          setConnecting(false);
          claimReceipt("wallet");
        },
        reduce ? 200 : 1200
      )
    );
  };

  /* ---------- claimed state: one receipt, claimed once ---------- */

  if (claimed) {
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col items-center px-6 py-10 text-center"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-neutral-950">
          <Check className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="mt-4 text-xl font-bold tracking-tight">Receipt claimed</p>
        <p className="mt-1.5 max-w-xs text-sm text-neutral-400">
          Taken via {LIVE_CLAIM_LABEL[receipt.claimMethod ?? "qr"]} ·{" "}
          <span className="font-mono text-emerald-300" data-mono>{receipt.reference}</span>
        </p>
        <div className="mt-5 flex w-full max-w-xs flex-col gap-2">
          <Link href={`/live/receipt/${receipt.claimToken}`}>
            <span className="flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-neutral-950 transition-colors hover:bg-emerald-400">
              View my receipt
            </span>
          </Link>
          <Link href="/live/wallet">
            <span className="flex w-full items-center justify-center rounded-xl border border-neutral-700 px-4 py-3 text-sm font-bold text-white transition-colors hover:border-emerald-500/60">
              Open my wallet
            </span>
          </Link>
          <p className="text-xs text-neutral-500">
            {formatMoney(pkr(totals.totalMinor))} · {tx.id} · Thank you for shopping with us!
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col px-5 py-6 sm:px-6">
      {view === "choose" && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col gap-4"
        >
          <div className="text-center">
            <p className="text-lg font-bold tracking-tight">How would you like to receive your receipt?</p>
            <p className="mt-1 font-mono text-sm text-emerald-300" data-mono>
              {receipt.reference} · {formatMoney(pkr(totals.totalMinor))}
            </p>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setView("qr")}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-900/50 px-4 py-6 text-center transition-colors hover:border-emerald-500/60"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800 text-emerald-300">
                <QrCode className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="text-sm font-bold">Scan QR Code</span>
              <span className="text-xs text-neutral-500">Point your phone camera to claim it</span>
            </button>
            <button
              type="button"
              onClick={() => setView("nfc")}
              className="group relative flex flex-col items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-900/50 px-4 py-6 text-center transition-colors hover:border-emerald-500/60"
            >
              <span className="absolute right-2.5 top-2.5 rounded-full bg-neutral-800 px-2 py-0.5 text-[0.625rem] font-bold tracking-wide text-neutral-400">
                SIMULATED
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800 text-emerald-300">
                <Nfc className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="text-sm font-bold">NFC / Tap to Receive</span>
              <span className="text-xs text-neutral-500">Hold your phone near the reader</span>
            </button>
            <button
              type="button"
              onClick={() => setView("wallet")}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-900/50 px-4 py-6 text-center transition-colors hover:border-emerald-500/60"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800 text-emerald-300">
                <Wallet className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="text-sm font-bold">Receipti Wallet</span>
              <span className="text-xs text-neutral-500">Save straight to your demo wallet</span>
            </button>
          </div>
        </motion.div>
      )}

      {view === "qr" && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="text-center">
            <p className="text-lg font-bold tracking-tight">Scan to claim</p>
            <p className="mt-1 text-sm text-neutral-400">
              The code carries an opaque claim token — no personal information.
            </p>
          </div>
          <div className="rounded-3xl bg-white p-5">
            <QRCode value={claimUrl || receipt.claimToken} size={200} aria-label={`Claim QR for receipt ${receipt.reference}`} />
          </div>
          <p className="font-mono text-sm text-neutral-400" data-mono>{receipt.reference}</p>
          <div className="flex w-full max-w-xs flex-col gap-2">
            <button
              type="button"
              onClick={() => claimReceipt("qr")}
              className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-neutral-950 transition-colors hover:bg-emerald-400"
            >
              Simulate phone scan (demo)
            </button>
            <button
              type="button"
              onClick={() => setView("choose")}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Choose another way
            </button>
          </div>
        </motion.div>
      )}

      {view === "nfc" && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div>
            <p className="text-lg font-bold tracking-tight">Tap to receive</p>
            <p className="mt-1 text-sm text-neutral-400">
              Press and hold — or just tap — to simulate the phone tap.{" "}
              <span className="font-semibold text-neutral-300">Prototype simulation, no real NFC transfer.</span>
            </p>
          </div>
          <div className="relative mt-2">
            {!reduce && (
              <span className="absolute -inset-3 rounded-full border-2 border-dashed border-neutral-800" aria-hidden="true" />
            )}
            <svg width="176" height="176" viewBox="0 0 176 176" className="absolute inset-0 -rotate-90" aria-hidden="true">
              <circle cx="88" cy="88" r="70" fill="none" strokeWidth="6" className="stroke-neutral-800" />
              <circle
                cx="88"
                cy="88"
                r="70"
                fill="none"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={RING_C}
                strokeDashoffset={RING_C * (1 - progress)}
                className="stroke-emerald-400"
              />
            </svg>
            <button
              type="button"
              onPointerDown={runHold}
              onPointerUp={cancelHold}
              onPointerLeave={cancelHold}
              onClick={runHold}
              aria-label="Press and hold to simulate receiving the receipt by NFC tap"
              className={cn(
                "relative flex h-44 w-44 touch-none select-none items-center justify-center rounded-full transition-colors",
                holding ? "bg-emerald-500 text-neutral-950" : "bg-neutral-900 text-emerald-300"
              )}
            >
              <Nfc className="h-16 w-16" aria-hidden="true" />
            </button>
          </div>
          <p className="text-sm font-semibold tnum" role="status" aria-live="polite">
            {holding ? `Receiving… ${Math.round(progress * 100)}%` : "Waiting for tap"}
          </p>
          <button
            type="button"
            onClick={() => {
              cancelHold();
              setView("choose");
            }}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Choose another way
          </button>
        </motion.div>
      )}

      {view === "wallet" && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 text-center"
        >
          <div>
            <p className="text-lg font-bold tracking-tight">Save to Receipti Wallet</p>
            <p className="mt-1 text-sm text-neutral-400">
              The receipt drops into the connected demo wallet — ready for returns and records.
            </p>
          </div>
          <div className="flex w-full items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/50 px-4 py-4 text-left">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-800 text-emerald-300">
              <Wallet className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">Receipti Wallet</p>
              <p className="font-mono text-xs text-neutral-500" data-mono>Demo customer · connected</p>
            </div>
            <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
          </div>
          <div className="flex w-full flex-col gap-2">
            <button
              type="button"
              onClick={saveToWallet}
              disabled={connecting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-neutral-950 transition-colors hover:bg-emerald-400 disabled:opacity-60"
            >
              {connecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Saving…
                </>
              ) : (
                "Save to wallet (Demo)"
              )}
            </button>
            <button
              type="button"
              onClick={() => setView("choose")}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Choose another way
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
