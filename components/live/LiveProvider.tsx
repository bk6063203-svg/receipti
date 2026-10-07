"use client";

import * as React from "react";
import {
  LIVE_MERCHANT,
  liveProductById,
  liveVariantByBarcode,
  variantOf,
  type BarcodeMatch,
  type LiveProduct,
} from "@/data/live-catalog";
import {
  LIVE_CHANNEL,
  LIVE_EVENT,
  buildClaimToken,
  buildLiveReference,
  isRemoteSyncConfigured,
  LIVE_CLAIM_LABEL,
  liveTotals,
  loadLiveTransaction,
  newLiveTransaction,
  nextLiveSequence,
  saveLiveTransaction,
  type LiveClaimMethod,
  type LiveDiscountType,
  type LivePayMethod,
  type LiveReceipt,
  type LiveSyncMode,
  type LiveTotals,
  type LiveTransaction,
} from "@/lib/live-transaction";
import { formatMoney } from "@/lib/format";
import { pkr } from "@/lib/live-transaction";
import { pushNotifyEvent } from "@/lib/notify";
import {
  LIVE_DEMO_CUSTOMER_ID,
  persistClaimedReceipt,
  persistIssuedReceipt,
} from "@/lib/live-receipt-record";

interface LiveContextValue {
  tx: LiveTransaction;
  totals: LiveTotals;
  /** "remote" when Supabase Realtime is connected, otherwise same-browser sync. */
  mode: LiveSyncMode;
  addVariant: (product: LiveProduct, size: string, colour: string) => void;
  /** Returns the matched variant, or null when the barcode is unknown. */
  scanBarcode: (code: string) => BarcodeMatch | null;
  setQuantity: (sku: string, qty: number) => void;
  removeLine: (sku: string) => void;
  changeVariant: (sku: string, size: string, colour: string) => void;
  setDiscount: (type: LiveDiscountType, value: number) => void;
  setTaxPct: (pct: number) => void;
  setMethod: (m: LivePayMethod) => void;
  canAdd: (productId: string) => boolean;
  /** Lock the bill and move to payment collection. */
  proceedToPayment: () => void;
  /** Unlock the bill back to scanning. */
  backToBill: () => void;
  /** Explicitly confirm the (simulated) payment — issues the receipt. No-op unless ready. */
  confirmPayment: () => void;
  /** Customer claims the issued receipt through one handoff. First claim wins. */
  claimReceipt: (method: LiveClaimMethod) => void;
  newTransaction: () => void;
}

const LiveContext = React.createContext<LiveContextValue | null>(null);

/**
 * One transaction state for every screen. Writes persist locally and publish
 * over Supabase Realtime broadcast when configured, so split-screen mounts
 * update instantly and separate tabs — or devices, with backend setup — stay
 * in sync through revision-guarded payloads. No refresh needed anywhere.
 */
export function LiveProvider({ children }: { children: React.ReactNode }) {
  const [tx, setTx] = React.useState<LiveTransaction>(() => loadLiveTransaction());
  const [mode, setMode] = React.useState<LiveSyncMode>("local");
  const publishRef = React.useRef<(tx: LiveTransaction) => void>(() => {});

  React.useEffect(() => {
    // Revision guard: stale or duplicate payloads (local echo, rebroadcasts) are ignored.
    const applyIncoming = (incoming: LiveTransaction) => {
      if (!incoming || typeof incoming.rev !== "number" || !Array.isArray(incoming.lines)) return;
      setTx((prev) => (incoming.rev > prev.rev ? incoming : prev));
    };
    const syncLocal = () => applyIncoming(loadLiveTransaction());
    syncLocal();
    window.addEventListener(LIVE_EVENT, syncLocal);
    window.addEventListener("storage", syncLocal);

    let cancelled = false;
    let cleanupRemote: (() => void) | undefined;
    (async () => {
      if (!isRemoteSyncConfigured()) return;
      try {
        const { createClient } = await import("@supabase/supabase-js");
        if (cancelled) return;
        const client = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const channel = client.channel(LIVE_CHANNEL, { config: { broadcast: { self: false } } });
        channel.on("broadcast", { event: "tx" }, ({ payload }) =>
          applyIncoming(payload as LiveTransaction)
        );
        channel.subscribe((status) => {
          if (!cancelled) setMode(status === "SUBSCRIBED" ? "remote" : "local");
        });
        publishRef.current = (next: LiveTransaction) => {
          channel.send({ type: "broadcast", event: "tx", payload: next });
        };
        cleanupRemote = () => {
          publishRef.current = () => {};
          client.removeChannel(channel);
        };
      } catch {
        if (!cancelled) setMode("local");
      }
    })();

    return () => {
      cancelled = true;
      window.removeEventListener(LIVE_EVENT, syncLocal);
      window.removeEventListener("storage", syncLocal);
      cleanupRemote?.();
    };
  }, []);

  const update = React.useCallback((fn: (prev: LiveTransaction) => LiveTransaction) => {
    setTx((prev) => {
      const next = fn(prev);
      if (next === prev) return prev;
      const versioned = { ...next, rev: prev.rev + 1 };
      saveLiveTransaction(versioned);
      publishRef.current(versioned);
      return versioned;
    });
  }, []);

  const productQty = React.useCallback(
    (productId: string): number =>
      tx.lines.filter((l) => l.productId === productId).reduce((n, l) => n + l.quantity, 0),
    [tx.lines]
  );

  const canAdd = React.useCallback(
    (productId: string): boolean => {
      const product = liveProductById(productId);
      if (!product) return false;
      return productQty(productId) < product.stock;
    },
    [productQty]
  );

  const addVariant = React.useCallback(
    (product: LiveProduct, size: string, colour: string) =>
      update((prev) => {
        if (prev.status !== "open") return prev;
        const inCart = prev.lines
          .filter((l) => l.productId === product.id)
          .reduce((n, l) => n + l.quantity, 0);
        if (inCart >= product.stock) return prev;
        const variant = variantOf(product, size, colour);
        const now = Date.now();
        const found = prev.lines.find((l) => l.sku === variant.sku);
        const lines = found
          ? prev.lines.map((l) =>
              l.sku === variant.sku ? { ...l, quantity: l.quantity + 1, updatedAt: now } : l
            )
          : [
              ...prev.lines,
              {
                productId: product.id,
                sku: variant.sku,
                name: product.name,
                size,
                colour,
                image: product.image,
                unitMinor: product.priceMinor,
                quantity: 1,
                updatedAt: now,
              },
            ];
        return { ...prev, lines };
      }),
    [update]
  );

  const scanBarcode = React.useCallback(
    (code: string) => {
      const match = liveVariantByBarcode(code);
      if (match) addVariant(match.product, match.size, match.colour);
      return match ?? null;
    },
    [addVariant]
  );

  const setQuantity = React.useCallback(
    (sku: string, qty: number) =>
      update((prev) => {
        if (prev.status !== "open") return prev;
        const line = prev.lines.find((l) => l.sku === sku);
        if (!line) return prev;
        const product = liveProductById(line.productId);
        const othersQty = prev.lines
          .filter((l) => l.productId === line.productId && l.sku !== sku)
          .reduce((n, l) => n + l.quantity, 0);
        const maxForLine = Math.max(0, (product?.stock ?? 99) - othersQty);
        const nextQty = Math.max(0, Math.min(maxForLine, Math.floor(qty) || 0));
        const lines =
          nextQty === 0
            ? prev.lines.filter((l) => l.sku !== sku)
            : prev.lines.map((l) =>
                l.sku === sku ? { ...l, quantity: nextQty, updatedAt: Date.now() } : l
              );
        return { ...prev, lines };
      }),
    [update]
  );

  const removeLine = React.useCallback(
    (sku: string) =>
      update((prev) =>
        prev.status !== "open" ? prev : { ...prev, lines: prev.lines.filter((l) => l.sku !== sku) }
      ),
    [update]
  );

  const changeVariant = React.useCallback(
    (sku: string, size: string, colour: string) =>
      update((prev) => {
        if (prev.status !== "open") return prev;
        const line = prev.lines.find((l) => l.sku === sku);
        if (!line) return prev;
        const product = liveProductById(line.productId);
        if (!product) return prev;
        const target = variantOf(product, size, colour);
        if (target.sku === sku) return prev;
        const now = Date.now();
        const existing = prev.lines.find((l) => l.sku === target.sku);
        if (existing) {
          // Merge into the matching variant line (clamped to stock).
          const merged = Math.min(product.stock, existing.quantity + line.quantity);
          return {
            ...prev,
            lines: prev.lines
              .filter((l) => l.sku !== sku)
              .map((l) => (l.sku === target.sku ? { ...l, quantity: merged, updatedAt: now } : l)),
          };
        }
        return {
          ...prev,
          lines: prev.lines.map((l) =>
            l.sku === sku ? { ...l, sku: target.sku, size, colour, updatedAt: now } : l
          ),
        };
      }),
    [update]
  );

  const setDiscount = React.useCallback(
    (type: LiveDiscountType, value: number) =>
      update((prev) =>
        prev.status !== "open" ? prev : { ...prev, discount: { type, value: Math.max(0, value) } }
      ),
    [update]
  );

  const setTaxPct = React.useCallback(
    (pct: number) =>
      update((prev) => (prev.status !== "open" ? prev : { ...prev, taxPct: Math.max(0, pct) })),
    [update]
  );

  const setMethod = React.useCallback(
    (m: LivePayMethod) =>
      update((prev) =>
        prev.status !== "open" && prev.status !== "ready" ? prev : { ...prev, method: m }
      ),
    [update]
  );

  const proceedToPayment = React.useCallback(
    () =>
      update((prev) =>
        prev.status !== "open" || prev.lines.length === 0 ? prev : { ...prev, status: "ready" }
      ),
    [update]
  );

  const backToBill = React.useCallback(
    () => update((prev) => (prev.status !== "ready" ? prev : { ...prev, status: "open" })),
    [update]
  );

  const confirmPayment = React.useCallback(
    () =>
      update((prev) => {
        if (prev.status !== "ready" || prev.lines.length === 0) return prev;
        const receipt: LiveReceipt = {
          reference: buildLiveReference(),
          claimToken: buildClaimToken(),
          issuedAt: new Date().toISOString(),
          claimedAt: null,
          claimMethod: null,
        };
        const finalized: LiveTransaction = {
          ...prev,
          status: "paid",
          paidAt: new Date().toISOString(),
          receipt,
        };
        void persistIssuedReceipt(finalized);
        const totals = liveTotals(prev);
        pushNotifyEvent({
          kind: "sale",
          title: `Sale completed · ${formatMoney(pkr(totals.totalMinor))}`,
          detail: `${LIVE_MERCHANT} (Live Demo) · ${prev.id}`,
          href: "/live",
        });
        return finalized;
      }),
    [update]
  );

  const claimReceipt = React.useCallback(
    (method: LiveClaimMethod) =>
      update((prev) => {
        if (prev.status !== "paid" || !prev.receipt || prev.receipt.claimedAt) return prev;
        const receipt: LiveReceipt = {
          ...prev.receipt,
          claimedAt: new Date().toISOString(),
          claimMethod: method,
        };
        void persistClaimedReceipt(
          receipt.reference,
          LIVE_DEMO_CUSTOMER_ID,
          method,
          LIVE_CLAIM_LABEL[method]
        );
        return { ...prev, receipt };
      }),
    [update]
  );

  const newTransaction = React.useCallback(
    () => update(() => newLiveTransaction(nextLiveSequence())),
    [update]
  );

  const value = React.useMemo<LiveContextValue>(
    () => ({
      tx,
      totals: liveTotals(tx),
      mode,
      addVariant,
      scanBarcode,
      setQuantity,
      removeLine,
      changeVariant,
      setDiscount,
      setTaxPct,
      setMethod,
      canAdd,
      proceedToPayment,
      backToBill,
      confirmPayment,
      claimReceipt,
      newTransaction,
    }),
    [
      tx,
      mode,
      addVariant,
      scanBarcode,
      setQuantity,
      removeLine,
      changeVariant,
      setDiscount,
      setTaxPct,
      setMethod,
      canAdd,
      proceedToPayment,
      backToBill,
      confirmPayment,
      claimReceipt,
      newTransaction,
    ]
  );

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}

export function useLive(): LiveContextValue {
  const ctx = React.useContext(LiveContext);
  if (!ctx) throw new Error("useLive must be used inside <LiveProvider>");
  return ctx;
}
