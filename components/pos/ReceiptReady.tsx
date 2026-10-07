"use client";

import * as React from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { motion } from "framer-motion";
import {
  Check,
  CheckCircle2,
  Copy,
  Link2,
  Mail,
  MessageCircle,
  Phone,
  Printer,
  RotateCcw,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import type { PosReceipt } from "@/types/pos";
import { formatDateTime, formatMoney } from "@/lib/format";
import { aed, PAYMENT_METHOD_LABEL } from "@/lib/pos";
import { Badge, Button, Card, Divider, Tooltip, TransactionStatusBadge } from "@/components/ui";
import { useToast } from "@/components/ui";

export function ReceiptReady({ receipt, onReset }: { receipt: PosReceipt; onReset: () => void }) {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);
  const [origin, setOrigin] = React.useState("");

  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const receiptUrl = origin ? `${origin}/receipt/${receipt.reference}` : `/receipt/${receipt.reference}`;

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
    document.body.classList.add("pos-print");
    const done = () => {
      document.body.classList.remove("pos-print");
      window.removeEventListener("afterprint", done);
    };
    window.addEventListener("afterprint", done);
    window.print();
    window.setTimeout(() => document.body.classList.remove("pos-print"), 1000);
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      {/* Success header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="pos-no-print text-center"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--r-primary)] text-white">
          <Check className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="type-h1 mt-4">✓ Payment successful</h2>
        <p className="type-body mt-1.5 text-ink-muted">Receipti receipt ready — hand off to the customer.</p>
        {/* Three independent states */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2" role="list" aria-label="Transaction states">
          <span role="listitem" className="inline-flex items-center gap-1.5 rounded-full border border-line bg-[var(--r-card)] px-3 py-1.5 type-status">
            <span className="text-ink-faint">Payment</span>
            <TransactionStatusBadge status="PAID" />
          </span>
          <span role="listitem" className="inline-flex items-center gap-1.5 rounded-full border border-line bg-[var(--r-card)] px-3 py-1.5 type-status">
            <span className="text-ink-faint">Receipt</span>
            <span className="inline-flex items-center gap-1 text-[var(--r-primary)]">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Ready
            </span>
          </span>
          <span role="listitem" className="inline-flex items-center gap-1.5 rounded-full border border-line bg-[var(--r-card)] px-3 py-1.5 type-status">
            <span className="text-ink-faint">Verification</span>
            <span className="inline-flex items-center gap-1 text-[var(--r-verified)]">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Verified
            </span>
          </span>
        </div>
        <p className="type-caption mx-auto mt-3 max-w-md text-ink-faint">
          “Verified” means this receipt record is recognized by Receipti — not that Receipti processed the payment.
        </p>
      </motion.div>

      <div className="grid gap-5 md:grid-cols-[1fr_0.9fr]">
        {/* Receipt summary */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.08 }}>
          <Card as="article" aria-label="Receipti receipt summary" padding="none" className="overflow-hidden">
            <div className="border-b border-line px-6 py-4">
              <p className="text-base font-bold">{receipt.merchant}</p>
              <p className="type-small text-ink-muted">{receipt.branch}</p>
              <p className="type-caption mt-0.5 text-ink-faint">{formatDateTime(receipt.issuedAt)}</p>
            </div>
            <ul className="divide-y divide-[var(--r-line)] px-6">
              {receipt.lines.map((l) => (
                <li key={l.sku} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{l.name}</p>
                    <p className="type-caption text-ink-muted tnum">
                      {l.quantity} × {formatMoney(aed(l.unitMinor))}
                    </p>
                  </div>
                  <p className="type-small shrink-0 font-semibold tnum" data-numeric>
                    {formatMoney(aed(l.lineMinor))}
                  </p>
                </li>
              ))}
            </ul>
            <dl className="space-y-1 px-6 py-4">
              <div className="flex justify-between">
                <dt className="type-small text-ink-muted">Subtotal</dt>
                <dd className="type-small tnum">{formatMoney(aed(receipt.subtotalMinor))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="type-small text-ink-muted">Tax (5% incl.)</dt>
                <dd className="type-small tnum">{formatMoney(aed(receipt.taxMinor))}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-line pt-2">
                <dt className="type-small font-semibold">Total</dt>
                <dd className="type-amount text-xl tnum" data-numeric>
                  {formatMoney(aed(receipt.totalMinor))}
                </dd>
              </div>
            </dl>
            <dl className="space-y-1.5 border-t border-dashed border-line bg-background/60 px-6 py-4">
              <div className="flex justify-between gap-3">
                <dt className="type-caption text-ink-muted">Receipt ID</dt>
                <dd className="type-caption font-semibold" data-mono>{receipt.id}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="type-caption text-ink-muted">Transaction</dt>
                <dd className="type-caption font-semibold" data-mono>{receipt.transactionId}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="type-caption text-ink-muted">Reference</dt>
                <dd className="type-caption font-semibold" data-mono>{receipt.reference}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="type-caption text-ink-muted">Paid via</dt>
                <dd className="type-caption font-semibold">{PAYMENT_METHOD_LABEL[receipt.paymentMethod]}</dd>
              </div>
            </dl>
          </Card>
        </motion.div>

        {/* Customer handoff */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.16 }}
          className="pos-no-print flex flex-col gap-5"
        >
          <Card as="section" aria-label="Customer handoff" className="flex flex-col items-center text-center">
            <p className="type-label text-[var(--r-primary)]">Digital receipt · primary</p>
            <h3 className="type-h3 mt-1.5">Ready for the customer</h3>
            <div className="mt-4 rounded-2xl border border-line bg-white p-4">
              {origin ? (
                <QRCode value={receiptUrl} size={168} fgColor="#111111" bgColor="#FFFFFF" aria-label={`QR code linking to receipt ${receipt.reference}`} />
              ) : (
                <span className="flex h-[168px] w-[168px] items-center justify-center text-ink-faint">
                  <ScanLine className="h-8 w-8" aria-hidden="true" />
                </span>
              )}
            </div>
            <p className="type-small mt-3 font-medium">Customer scans to receive the receipt</p>
            <p className="type-caption mt-1 break-all text-ink-faint" data-mono>
              /receipt/{receipt.reference}
            </p>
            <div className="mt-4 flex w-full flex-col gap-2">
              <Button variant="secondary" className="w-full" onClick={copyLink} leftIcon={copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}>
                {copied ? "Link copied" : "Copy receipt link"}
              </Button>
              <div className="flex items-center gap-2">
                <Tooltip content="Prototype placeholder — no real message is sent.">
                  <span className="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-dashed border-line px-2 py-2.5 text-[0.8125rem] text-ink-faint">
                    <MessageCircle className="h-4 w-4" aria-hidden="true" /> SMS
                  </span>
                </Tooltip>
                <Tooltip content="Prototype placeholder — no real message is sent.">
                  <span className="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-dashed border-line px-2 py-2.5 text-[0.8125rem] text-ink-faint">
                    <Mail className="h-4 w-4" aria-hidden="true" /> Email
                  </span>
                </Tooltip>
                <Tooltip content="Prototype placeholder — no real message is sent.">
                  <span className="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-dashed border-line px-2 py-2.5 text-[0.8125rem] text-ink-faint">
                    <Phone className="h-4 w-4" aria-hidden="true" /> WhatsApp
                  </span>
                </Tooltip>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <p className="type-small font-semibold">Print receipt</p>
              <Badge tone="neutral">Secondary fallback</Badge>
            </div>
            <p className="type-caption text-ink-muted">
              Paper stays available as a fallback where needed. Digital remains primary.
            </p>
            <div className="mt-1 flex flex-col gap-2">
              <Button variant="outline" onClick={print} leftIcon={<Printer className="h-4 w-4" aria-hidden="true" />}>
                Print receipt
              </Button>
              <Divider />
              <Button onClick={onReset} leftIcon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}>
                New Transaction
              </Button>
              <Divider />
              <div className="grid grid-cols-2 gap-2">
                <Link href={`/receipt/${receipt.reference}`}>
                  <Button variant="outline" className="w-full">
                    Open receipt
                  </Button>
                </Link>
                <Link href="/merchant">
                  <Button variant="outline" className="w-full">
                    Merchant portal
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
