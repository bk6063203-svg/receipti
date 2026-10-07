"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Banknote,
  Check,
  CreditCard,
  Landmark,
  Loader2,
  Minus,
  Plus,
  ReceiptText,
  RotateCcw,
  ScanBarcode,
  ShoppingCart,
  Smartphone,
  Store,
  Trash2,
  Wallet,
} from "lucide-react";
import {
  LIVE_BRANCH,
  LIVE_CATEGORIES,
  LIVE_MERCHANT,
  LIVE_PRODUCTS,
  LIVE_TAX_PRESETS,
  liveVariantByBarcode,
  variantOf,
  type LiveProduct,
} from "@/data/live-catalog";
import { formatDateTime, formatMoney } from "@/lib/format";
import {
  LIVE_CLAIM_LABEL,
  LIVE_METHOD_LABEL,
  liveDiscountLabel,
  pkr,
  type LiveDiscountType,
  type LivePayMethod,
} from "@/lib/live-transaction";
import {
  Badge,
  Button,
  Card,
  Divider,
  EmptyState,
  IconButton,
  Input,
  Modal,
  useToast,
} from "@/components/ui";
import { useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useLive } from "./LiveProvider";
import { ProductThumb } from "./ProductThumb";
import { SyncBadge } from "./SyncBadge";

const DISCOUNT_PCTS = [0, 5, 10, 15];

const METHOD_ICON: Record<LivePayMethod, typeof Banknote> = {
  CASH: Banknote,
  CARD: CreditCard,
  JAZZCASH: Smartphone,
  EASYPaisa: Wallet,
  BANK: Landmark,
};

interface CardSelection {
  size: string;
  colour: string;
}

const defaultSelection = (p: LiveProduct): CardSelection => ({
  size: p.sizes[0]!,
  colour: p.colours[0]!.name,
});

export function MerchantPos() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const {
    tx,
    totals,
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
    newTransaction,
  } = useLive();

  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>("All");
  const [barcode, setBarcode] = React.useState("");
  const [barcodeError, setBarcodeError] = React.useState<string | null>(null);
  const [lastScan, setLastScan] = React.useState<string | null>(null);
  const [selections, setSelections] = React.useState<Record<string, CardSelection>>({});
  const [flashSku, setFlashSku] = React.useState<string | null>(null);
  const [flatInput, setFlatInput] = React.useState("");
  const [payOpen, setPayOpen] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);
  const timers = React.useRef<number[]>([]);

  React.useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  const paid = tx.status === "paid";
  const ready = tx.status === "ready";
  const locked = tx.status !== "open";

  // If another screen moves the transaction (confirm / back-to-bill from a
  // second tab), this till's payment dialog follows instead of going stale.
  React.useEffect(() => {
    if (tx.status !== "ready") {
      setPayOpen(false);
      setConfirming(false);
    }
  }, [tx.status]);

  const selOf = (p: LiveProduct): CardSelection => selections[p.id] ?? defaultSelection(p);

  const setSel = (p: LiveProduct, patch: Partial<CardSelection>) =>
    setSelections((prev) => ({ ...prev, [p.id]: { ...selOf(p), ...patch } }));

  const cartQty = React.useCallback(
    (productId: string): number =>
      tx.lines.filter((l) => l.productId === productId).reduce((n, l) => n + l.quantity, 0),
    [tx.lines]
  );

  const barcodesByProduct = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const p of LIVE_PRODUCTS) {
      const codes: string[] = [];
      for (const size of p.sizes) {
        for (const colour of p.colours) codes.push(variantOf(p, size, colour.name).barcode);
      }
      map.set(p.id, codes.join(" "));
    }
    return map;
  }, []);

  const shown = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return LIVE_PRODUCTS.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        (q === "" ||
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          (barcodesByProduct.get(p.id) ?? "").includes(q))
    );
  }, [query, category, barcodesByProduct]);

  const flash = (sku: string) => {
    setFlashSku(sku);
    timers.current.push(window.setTimeout(() => setFlashSku((cur) => (cur === sku ? null : cur)), 900));
  };

  const scanSelection = (p: LiveProduct) => {
    if (locked) return;
    if (!canAdd(p.id)) {
      toast({ title: "Out of stock", description: `${p.name} — no units left.`, tone: "error" });
      return;
    }
    const sel = selOf(p);
    addVariant(p, sel.size, sel.colour);
    setLastScan(`${p.name} · ${sel.colour} · ${sel.size}`);
    flash(variantOf(p, sel.size, sel.colour).sku);
  };

  const doScan = () => {
    if (locked || barcode.trim() === "") return;
    const match = liveVariantByBarcode(barcode);
    if (!match) {
      setBarcodeError(`No product found for barcode ${barcode.trim()}.`);
      return;
    }
    if (!canAdd(match.product.id)) {
      setBarcodeError(`${match.product.name} is out of stock.`);
      return;
    }
    scanBarcode(barcode);
    setBarcodeError(null);
    setLastScan(`${match.product.name} · ${match.colour} · ${match.size}`);
    flash(match.variant.sku);
    setBarcode("");
  };

  const openPayment = () => {
    if (tx.status !== "open" || totals.count === 0) return;
    proceedToPayment();
    setPayOpen(true);
  };

  const closePayment = (revert: boolean) => {
    setPayOpen(false);
    setConfirming(false);
    if (revert && tx.status === "ready") {
      backToBill();
      toast({ title: "Back to bill", description: "Transaction unlocked for editing.", tone: "info" });
    }
  };

  const doConfirm = () => {
    if (tx.status !== "ready" || confirming) return;
    setConfirming(true);
    timers.current.push(
      window.setTimeout(
        () => {
          confirmPayment();
          setPayOpen(false);
          setConfirming(false);
          toast({ title: "Payment confirmed", description: `${tx.id} · receipt issued.`, tone: "success" });
        },
        reduce ? 200 : 1200
      )
    );
  };

  const doNew = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setPayOpen(false);
    setConfirming(false);
    setBarcode("");
    setBarcodeError(null);
    setLastScan(null);
    setFlatInput("");
    newTransaction();
  };

  const applyFlat = () => {
    const rupees = Math.max(0, Math.floor(Number(flatInput) || 0));
    setDiscount("flat", rupees * 100);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Till header */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--r-primary-muted)] text-[var(--r-primary)]">
          <Store className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold">{LIVE_MERCHANT} · POS 1</p>
          <p className="type-caption text-ink-muted">{LIVE_BRANCH}</p>
        </div>
        <SyncBadge />
        <Badge tone={paid ? "success" : "info"} dot>
          {tx.id}
        </Badge>
        <Badge tone={paid ? "success" : ready ? "warning" : "neutral"}>
          {paid ? "Paid" : ready ? "Ready for payment" : "Scanning"}
        </Badge>
        <Button variant="outline" size="sm" onClick={doNew} leftIcon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}>
          New transaction
        </Button>
      </div>

      {/* Payment in progress (dialog closed, bill locked) */}
      {ready && !payOpen && (
        <Card className="flex flex-wrap items-center gap-3 border-[var(--r-warning)]">
          <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--r-warning)] opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--r-warning)]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Collecting payment — bill is locked</p>
            <p className="type-caption text-ink-muted">
              The customer sees “Your bill is ready.” Finish payment or go back to edit.
            </p>
          </div>
          <Button size="sm" onClick={() => setPayOpen(true)}>Resume payment</Button>
          <Button size="sm" variant="outline" onClick={() => closePayment(true)}>Back to bill</Button>
        </Card>
      )}

      {/* Receipt issued + claim status */}
      {paid && tx.receipt && (
        <Card className="flex flex-col gap-3 border-[var(--r-verified)]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--r-verified-muted)] text-[var(--r-verified)]">
              <ReceiptText className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">
                Receipt issued · <span className="font-mono" data-mono>{tx.receipt.reference}</span>
              </p>
              <p className="type-caption text-ink-muted tnum">
                {formatDateTime(tx.receipt.issuedAt)} · {LIVE_METHOD_LABEL[tx.method]}
              </p>
            </div>
            {tx.receipt.claimedAt ? (
              <Badge tone="success" dot>
                Claimed · {LIVE_CLAIM_LABEL[tx.receipt.claimMethod ?? "qr"]}
              </Badge>
            ) : (
              <Badge tone="warning" dot>Awaiting customer</Badge>
            )}
          </div>
          <p className="type-small text-ink-muted">
            {tx.receipt.claimedAt
              ? `Customer claimed the receipt via ${LIVE_CLAIM_LABEL[tx.receipt.claimMethod ?? "qr"]} at ${formatDateTime(tx.receipt.claimedAt)}.`
              : "The customer is choosing how to take the receipt — QR, NFC tap, or wallet. This status flips the moment they claim it."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href={`/live/receipt/${tx.receipt.claimToken}`} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline">View issued receipt</Button>
            </Link>
            <Button size="sm" onClick={doNew} leftIcon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}>
              New transaction
            </Button>
          </div>
        </Card>
      )}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_23rem]">
        {/* Catalog */}
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Search products"
                placeholder="Name, category, or barcode…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
              />
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    label="Barcode scanner"
                    placeholder="Scan a variant barcode…"
                    value={barcode}
                    inputMode="numeric"
                    autoComplete="off"
                    disabled={locked}
                    onChange={(e) => {
                      setBarcode(e.target.value);
                      if (barcodeError) setBarcodeError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") doScan();
                    }}
                  />
                </div>
                <Button onClick={doScan} disabled={locked || barcode.trim() === ""} leftIcon={<ScanBarcode className="h-4 w-4" aria-hidden="true" />}>
                  Scan
                </Button>
              </div>
            </div>
            {barcodeError && (
              <p role="alert" className="rounded-xl bg-[var(--r-danger-muted)] px-3.5 py-2.5 text-sm font-medium text-[var(--r-danger)]">
                {barcodeError}
              </p>
            )}
            {lastScan && !barcodeError && (
              <p className="type-small flex items-center gap-1.5 text-ink-muted" role="status">
                <Check className="h-4 w-4 shrink-0 text-[var(--r-verified)]" aria-hidden="true" />
                Last scanned: <strong className="text-ink">{lastScan}</strong>
              </p>
            )}
          </Card>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Categories">
            {LIVE_CATEGORIES.map((c) => (
              <Button key={c} size="sm" variant={category === c ? "primary" : "outline"} onClick={() => setCategory(c)}>
                {c}
              </Button>
            ))}
          </div>

          {shown.length === 0 ? (
            <Card>
              <EmptyState
                icon={<ShoppingCart className="h-8 w-8" aria-hidden="true" />}
                title="No products match"
                description="Try a different search or category."
              />
            </Card>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Products">
              {shown.map((p) => {
                const sel = selOf(p);
                const variant = variantOf(p, sel.size, sel.colour);
                const available = p.stock - cartQty(p.id);
                const out = available <= 0;
                const flashed = flashSku === variant.sku;
                return (
                  <li key={p.id}>
                    <Card
                      className={cn(
                        "flex h-full cursor-pointer flex-col gap-3 transition-colors",
                        flashed
                          ? "border-[var(--r-verified)] ring-2 ring-[var(--r-verified-muted)]"
                          : "hover:border-[var(--r-primary)]",
                        (out || locked) && "opacity-70"
                      )}
                      onClick={() => scanSelection(p)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          scanSelection(p);
                        }
                      }}
                      tabIndex={locked ? -1 : 0}
                      role="button"
                      aria-label={`Scan ${p.name}, ${sel.colour}, size ${sel.size}`}
                      aria-disabled={locked || out}
                    >
                      <div className="flex items-start gap-3">
                        <ProductThumb image={p.image} name={p.name} size={72} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold">{p.name}</p>
                          <p className="type-caption mt-0.5 text-ink-muted">
                            {p.category} · {p.code}
                          </p>
                          <p className="mt-1 text-sm font-bold text-[var(--r-primary)] tnum">
                            {formatMoney(pkr(p.priceMinor))}
                          </p>
                        </div>
                      </div>

                      {p.sizes.length > 1 && (
                        <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Size for ${p.name}`} onClick={(e) => e.stopPropagation()}>
                          {p.sizes.map((s) => (
                            <button
                              key={s}
                              type="button"
                              disabled={locked}
                              onClick={() => setSel(p, { size: s })}
                              aria-pressed={sel.size === s}
                              className={cn(
                                "rounded-lg border px-2.5 py-1 text-xs font-bold transition-colors",
                                sel.size === s
                                  ? "border-[var(--r-primary)] bg-[var(--r-primary-muted)] text-[var(--r-primary)]"
                                  : "border-line text-ink-muted hover:border-ink-faint"
                              )}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}

                      {p.colours.length > 1 && (
                        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={`Colour for ${p.name}`} onClick={(e) => e.stopPropagation()}>
                          {p.colours.map((c) => (
                            <button
                              key={c.name}
                              type="button"
                              disabled={locked}
                              onClick={() => setSel(p, { colour: c.name })}
                              title={c.name}
                              aria-label={`${c.name} for ${p.name}`}
                              aria-pressed={sel.colour === c.name}
                              style={{ backgroundColor: c.swatch }}
                              className={cn(
                                "h-6 w-6 rounded-full border border-line transition-transform",
                                sel.colour === c.name && "ring-2 ring-[var(--r-primary)] ring-offset-2 ring-offset-[var(--r-card)]"
                              )}
                            />
                          ))}
                          <span className="type-caption font-semibold text-ink-muted">{sel.colour} · {sel.size}</span>
                        </div>
                      )}

                      <div className="mt-auto flex items-center justify-between gap-2">
                        <span className="type-caption text-ink-faint tnum" data-mono>{variant.sku}</span>
                        {out ? (
                          <span className="type-caption font-bold text-[var(--r-danger)]">Out of stock</span>
                        ) : available <= 5 ? (
                          <span className="type-caption font-bold text-[var(--r-warning)]">Only {available} left</span>
                        ) : (
                          <span className="type-caption text-ink-faint tnum">{available} in stock</span>
                        )}
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Bill */}
        <Card className="flex flex-col gap-3 xl:sticky xl:top-24">
          <div className="flex items-center justify-between">
            <h2 className="type-h3">Current bill</h2>
            <Badge className="tnum">{totals.count} item{totals.count === 1 ? "" : "s"}</Badge>
          </div>

          {tx.lines.length === 0 ? (
            <EmptyState
              icon={<ReceiptText className="h-8 w-8" aria-hidden="true" />}
              title={paid ? "Transaction complete" : "Bill is empty"}
              description={paid ? "Start a new transaction for the next customer." : "Scan or tap a product to begin the bill."}
            />
          ) : (
            <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-0.5" aria-label="Bill lines">
              <AnimatePresence initial={false}>
                {tx.lines.map((l) => {
                  const product = LIVE_PRODUCTS.find((p) => p.id === l.productId);
                  return (
                    <motion.li
                      key={l.sku}
                      layout={!reduce}
                      initial={reduce ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? undefined : { opacity: 0, x: 12 }}
                      transition={{ duration: 0.16 }}
                      className="flex flex-col gap-2 rounded-xl border border-line px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <ProductThumb image={l.image} name={l.name} size={44} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{l.name}</p>
                          <p className="type-caption text-ink-muted tnum">
                            {l.size} · {l.colour} · {formatMoney(pkr(l.unitMinor))} each
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-bold tnum">
                          {formatMoney(pkr(l.unitMinor * l.quantity))}
                        </span>
                        <IconButton label={`Remove ${l.name}`} size="sm" variant="ghost" disabled={locked} onClick={() => removeLine(l.sku)}>
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </IconButton>
                      </div>
                      <div className="flex items-center gap-2">
                        {product && product.sizes.length > 1 && (
                          <label className="flex flex-1 items-center gap-1.5">
                            <span className="type-caption font-semibold text-ink-faint">Size</span>
                            <select
                              aria-label={`Size for ${l.name}`}
                              value={l.size}
                              disabled={locked}
                              onChange={(e) => changeVariant(l.sku, e.target.value, l.colour)}
                              className="w-full min-w-0 flex-1 rounded-lg border border-line bg-[var(--r-card)] px-2 py-1.5 text-xs font-semibold disabled:opacity-50"
                            >
                              {product.sizes.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </label>
                        )}
                        {product && product.colours.length > 1 && (
                          <label className="flex flex-1 items-center gap-1.5">
                            <span className="type-caption font-semibold text-ink-faint">Colour</span>
                            <select
                              aria-label={`Colour for ${l.name}`}
                              value={l.colour}
                              disabled={locked}
                              onChange={(e) => changeVariant(l.sku, l.size, e.target.value)}
                              className="w-full min-w-0 flex-1 rounded-lg border border-line bg-[var(--r-card)] px-2 py-1.5 text-xs font-semibold disabled:opacity-50"
                            >
                              {product.colours.map((c) => (
                                <option key={c.name} value={c.name}>{c.name}</option>
                              ))}
                            </select>
                          </label>
                        )}
                        <div className="ml-auto flex shrink-0 items-center gap-1" role="group" aria-label={`Quantity for ${l.name}`}>
                          <IconButton label={`Decrease quantity of ${l.name}`} size="sm" variant="outline" disabled={locked} onClick={() => setQuantity(l.sku, l.quantity - 1)}>
                            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                          </IconButton>
                          <span className="w-6 text-center text-sm font-bold tnum">{l.quantity}</span>
                          <IconButton label={`Increase quantity of ${l.name}`} size="sm" variant="outline" disabled={locked} onClick={() => setQuantity(l.sku, l.quantity + 1)}>
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          </IconButton>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}

          <div>
            <p className="type-caption mb-1.5 font-semibold text-ink-muted">Discount</p>
            <div className="flex gap-1.5" role="group" aria-label="Discount type">
              {(["percent", "flat"] as LiveDiscountType[]).map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={tx.discount.type === t ? "primary" : "outline"}
                  disabled={locked}
                  onClick={() => {
                    if (t === "percent") setDiscount("percent", 0);
                    else {
                      setFlatInput("");
                      setDiscount("flat", 0);
                    }
                  }}
                  className="flex-1"
                >
                  {t === "percent" ? "Percent %" : "Fixed Rs"}
                </Button>
              ))}
            </div>
            {tx.discount.type === "percent" ? (
              <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Discount percent">
                {DISCOUNT_PCTS.map((d) => (
                  <Button key={d} size="sm" variant={tx.discount.value === d ? "primary" : "outline"} disabled={locked} onClick={() => setDiscount("percent", d)}>
                    {d === 0 ? "None" : `${d}%`}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="mt-2 flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    label="Flat discount (PKR)"
                    placeholder="e.g. 500"
                    value={flatInput}
                    inputMode="numeric"
                    autoComplete="off"
                    disabled={locked}
                    onChange={(e) => setFlatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") applyFlat();
                    }}
                  />
                </div>
                <Button variant="outline" disabled={locked} onClick={applyFlat}>Apply</Button>
              </div>
            )}
          </div>

          <div>
            <p className="type-caption mb-1.5 font-semibold text-ink-muted">
              Sales tax <span className="font-normal text-ink-faint">(configurable demo rate)</span>
            </p>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Demo tax rate">
              {LIVE_TAX_PRESETS.map((t) => (
                <Button key={t} size="sm" variant={tx.taxPct === t ? "primary" : "outline"} disabled={locked} onClick={() => setTaxPct(t)}>
                  {t}%
                </Button>
              ))}
            </div>
          </div>

          <Divider />

          <dl className="flex flex-col gap-1.5">
            <div className="flex justify-between">
              <dt className="type-small text-ink-muted">Subtotal</dt>
              <dd className="type-small font-semibold tnum">{formatMoney(pkr(totals.subtotalMinor))}</dd>
            </div>
            {totals.discountMinor > 0 && (
              <div className="flex justify-between">
                <dt className="type-small text-ink-muted">Discount ({liveDiscountLabel(tx.discount)})</dt>
                <dd className="type-small font-semibold text-[var(--r-verified)] tnum">
                  −{formatMoney(pkr(totals.discountMinor))}
                </dd>
              </div>
            )}
            {totals.discountMinor > 0 && (
              <div className="flex justify-between">
                <dt className="type-small text-ink-muted">Amount before tax</dt>
                <dd className="type-small font-semibold tnum">{formatMoney(pkr(totals.netMinor))}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="type-small text-ink-muted">Sales tax ({tx.taxPct}%)</dt>
              <dd className="type-small font-semibold tnum">{formatMoney(pkr(totals.taxMinor))}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-2">
              <dt className="text-sm font-bold">Total payable</dt>
              <dd className="text-xl font-bold text-[var(--r-primary)] tnum" data-numeric>
                {formatMoney(pkr(totals.totalMinor))}
              </dd>
            </div>
          </dl>

          {paid ? (
            <Button size="lg" className="w-full" onClick={doNew} leftIcon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}>
              New transaction
            </Button>
          ) : ready ? (
            <Button size="lg" className="w-full" onClick={() => setPayOpen(true)}>
              Resume payment · {formatMoney(pkr(totals.totalMinor))}
            </Button>
          ) : (
            <Button size="lg" className="w-full" disabled={totals.count === 0} onClick={openPayment}>
              Proceed to Payment · {formatMoney(pkr(totals.totalMinor))}
            </Button>
          )}
        </Card>
      </div>

      {/* Payment collection */}
      <Modal
        open={payOpen}
        onClose={() => closePayment(false)}
        title="Collect payment"
        description={`${tx.id} · ${totals.count} item${totals.count === 1 ? "" : "s"} — the customer sees “Your bill is ready.”`}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => closePayment(true)} leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}>
              Back to bill
            </Button>
            <Button onClick={doConfirm} disabled={confirming}>
              {confirming ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Confirming…
                </span>
              ) : (
                <>Confirm Payment (Demo) · {formatMoney(pkr(totals.totalMinor))}</>
              )}
            </Button>
          </>
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <h3 className="type-h4">Bill summary</h3>
            <ul className="flex max-h-56 flex-col gap-2 overflow-y-auto pr-0.5" aria-label="Final bill lines">
              {tx.lines.map((l) => (
                <li key={l.sku} className="flex items-center gap-2.5 rounded-xl border border-line px-3 py-2">
                  <ProductThumb image={l.image} name={l.name} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{l.name}</p>
                    <p className="type-caption text-ink-muted tnum">
                      {l.size} · {l.colour} · {l.quantity} × {formatMoney(pkr(l.unitMinor))}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold tnum">
                    {formatMoney(pkr(l.unitMinor * l.quantity))}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="flex flex-col gap-1 rounded-xl bg-background px-4 py-3">
              <div className="flex justify-between">
                <dt className="type-small text-ink-muted">Subtotal</dt>
                <dd className="type-small font-semibold tnum">{formatMoney(pkr(totals.subtotalMinor))}</dd>
              </div>
              {totals.discountMinor > 0 && (
                <div className="flex justify-between">
                  <dt className="type-small text-ink-muted">Discount ({liveDiscountLabel(tx.discount)})</dt>
                  <dd className="type-small font-semibold text-[var(--r-verified)] tnum">
                    −{formatMoney(pkr(totals.discountMinor))}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="type-small text-ink-muted">Sales tax ({tx.taxPct}%)</dt>
                <dd className="type-small font-semibold tnum">{formatMoney(pkr(totals.taxMinor))}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-line pt-1.5">
                <dt className="text-sm font-bold">Payable</dt>
                <dd className="text-lg font-bold text-[var(--r-primary)] tnum" data-numeric>
                  {formatMoney(pkr(totals.totalMinor))}
                </dd>
              </div>
            </dl>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="type-h4">Payment method</h3>
            <div className="flex flex-col gap-2" role="radiogroup" aria-label="Payment method">
              {(Object.keys(LIVE_METHOD_LABEL) as LivePayMethod[]).map((m) => {
                const Icon = METHOD_ICON[m];
                const selected = tx.method === m;
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
                    {LIVE_METHOD_LABEL[m]}
                    {selected && <Check className="ml-auto h-4 w-4" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
            <p className="type-caption rounded-xl bg-background px-3.5 py-2.5 text-ink-muted">
              Demonstration only — no real payment gateway is connected. Confirming issues the
              receipt and the customer display switches to “Payment Confirmed (Demo)”.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
