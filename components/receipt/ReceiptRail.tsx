"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Check,
  CircleDashed,
  Copy,
  CreditCard,
  Download,
  Loader2,
  Printer,
  ScanSearch,
  Share2,
  ShieldCheck,
  Store,
  Undo2,
  Wallet,
} from "lucide-react";
import type { PosReceipt } from "@/types/pos";
import { formatDateTime, formatMoney } from "@/lib/format";
import { aed, PAYMENT_METHOD_LABEL, receiptTxState } from "@/lib/pos";
import { saveReceipt } from "@/lib/pos-store";
import { refundableMinorTotal, refundedMinorTotal, updateRefundStatus } from "@/lib/refunds";
import { isReceiptSaved, setReceiptSaved } from "@/lib/wallet-store";
import { RefundHistory, RefundWizard } from "@/components/refunds";
import { Button, Card, Modal, TransactionStatusBadge, useToast, VerificationStatusBadge } from "@/components/ui";
import { Rise } from "./Rise";

/* ---------------- shared receipt actions ---------------- */

function receiptTextSummary(receipt: PosReceipt): string {
  const lines = [
    `${receipt.merchant} · ${receipt.branch}`,
    `Receipt ${receipt.id} · Transaction ${receipt.transactionId}`,
    `Issued ${formatDateTime(receipt.issuedAt)}`,
    "",
    ...receipt.lines.map(
      (l) => `${l.quantity} x ${l.name} (${l.sku}) — ${formatMoney(aed(l.lineMinor))}`
    ),
    "",
    `Subtotal ${formatMoney(aed(receipt.subtotalMinor))}`,
    `Discount ${formatMoney(aed(receipt.discountMinor))}`,
    `Tax ${formatMoney(aed(receipt.taxMinor))}`,
    `TOTAL ${formatMoney(aed(receipt.totalMinor))} via ${PAYMENT_METHOD_LABEL[receipt.paymentMethod]}`,
    `Reference ${receipt.reference}`,
  ];
  return lines.join("\n");
}

export function useReceiptActions(receipt: PosReceipt) {
  const { toast } = useToast();
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    setSaved(isReceiptSaved(receipt.reference));
  }, [receipt.reference]);

  const toggleSave = React.useCallback(() => {
    const next = !saved;
    setReceiptSaved(receipt.reference, next);
    setSaved(next);
    toast(
      next
        ? { title: "Saved", description: "This receipt is saved in your wallet.", tone: "success" }
        : { title: "Removed from wallet", description: "The trusted record is preserved.", tone: "info" }
    );
  }, [saved, receipt.reference, toast]);

  const share = React.useCallback(async () => {
    const url = window.location.href;
    const data = {
      title: `Receipt ${receipt.id}`,
      text: `${receipt.merchant} · ${formatMoney(aed(receipt.totalMinor))} · ${receipt.id}`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Receipt link copied", description: receipt.reference, tone: "success" });
      }
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") {
        toast({ title: "Share unavailable", description: "Copy the receipt reference instead.", tone: "error" });
      }
    }
  }, [receipt, toast]);

  const print = React.useCallback(() => {
    document.body.classList.add("receipt-print");
    const done = () => {
      document.body.classList.remove("receipt-print");
      window.removeEventListener("afterprint", done);
    };
    window.addEventListener("afterprint", done);
    window.print();
    window.setTimeout(() => document.body.classList.remove("receipt-print"), 1000);
  }, []);

  const download = React.useCallback(() => {
    const blob = new Blob([receiptTextSummary(receipt)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${receipt.reference}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast({ title: "Receipt downloaded", description: `${receipt.reference}.txt`, tone: "success" });
  }, [receipt, toast]);

  return { saved, toggleSave, share, print, download };
}

/* ---------------- actions card ---------------- */

export function ActionsCard({ receipt, actions }: { receipt: PosReceipt; actions: ReturnType<typeof useReceiptActions> }) {
  const hasRefunds = (receipt.refunds ?? []).length > 0;
  return (
    <Card as="section" aria-label="Receipt actions" className="no-print flex flex-col gap-2">
      <Button
        size="lg"
        variant={actions.saved ? "secondary" : "primary"}
        className="w-full"
        onClick={actions.toggleSave}
        leftIcon={
          actions.saved ? (
            <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Bookmark className="h-4 w-4" aria-hidden="true" />
          )
        }
      >
        {actions.saved ? "Saved" : "Save to Wallet"}
      </Button>
      {actions.saved && (
        <Link href="/customer/wallet" className="w-full">
          <Button variant="outline" className="w-full" leftIcon={<Wallet className="h-4 w-4" aria-hidden="true" />}>
            View in Wallet
          </Button>
        </Link>
      )}
      <Link href="/verify" className="w-full">
        <Button variant="outline" className="w-full" leftIcon={<ScanSearch className="h-4 w-4" aria-hidden="true" />}>
          Verify receipt
        </Button>
      </Link>
      {hasRefunds && (
        <a href="#refunds" className="w-full">
          <Button variant="outline" className="w-full" leftIcon={<Undo2 className="h-4 w-4" aria-hidden="true" />}>
            View refund details
          </Button>
        </a>
      )}
      <div className="flex gap-2">
        <Button variant="ghost" className="flex-1" onClick={actions.share} leftIcon={<Share2 className="h-4 w-4" aria-hidden="true" />}>
          Share
        </Button>
        <Button variant="ghost" className="flex-1" onClick={actions.download} leftIcon={<Download className="h-4 w-4" aria-hidden="true" />}>
          Download
        </Button>
        <Button variant="ghost" className="flex-1" onClick={actions.print} leftIcon={<Printer className="h-4 w-4" aria-hidden="true" />}>
          Print
        </Button>
      </div>
      <p className="type-caption text-center text-ink-faint">
        Digital is primary — print stays as a fallback. Receipt #{receipt.id} · no account needed in this prototype.
      </p>
    </Card>
  );
}

/* ---------------- status card ---------------- */

const TX_LABEL: Record<string, string> = {
  PAID: "Paid",
  PARTIALLY_REFUNDED: "Partially refunded",
  REFUNDED: "Refunded",
};

export function StatusCard({ receipt }: { receipt: PosReceipt }) {
  const tx = receiptTxState(receipt);
  const refunds = receipt.refunds ?? [];
  const completed = refunds.filter((r) => (r.status ?? "COMPLETED") === "COMPLETED");
  const openCount = refunds.filter((r) => r.status === "PENDING" || r.status === "PROCESSING").length;
  const refundedMinor = refundedMinorTotal(receipt);

  return (
    <Card as="section" aria-label="Receipt status">
      <h2 className="flex items-center gap-2 text-[0.9375rem] font-semibold">
        <Activity className="h-4 w-4 text-ink-muted" aria-hidden="true" />
        Status
      </h2>
      <dl className="mt-3 space-y-2.5">
        <div className="flex items-center justify-between gap-3">
          <dt className="type-small text-ink-muted">Transaction</dt>
          <dd>
            {tx === "PARTIALLY_REFUNDED" ? (
              <span className="type-status inline-flex items-center gap-1.5 rounded-full bg-[var(--r-warning-muted)] px-2.5 py-1 text-[var(--r-warning)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--r-warning)]" aria-hidden="true" />
                {TX_LABEL[tx]}
              </span>
            ) : (
              <TransactionStatusBadge status={tx} />
            )}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="type-small text-ink-muted">Verification</dt>
          <dd>
            <VerificationStatusBadge status={receipt.verification} />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line pt-2.5">
          <dt className="type-small text-ink-muted">Refunds</dt>
          <dd className="type-small text-right font-semibold tnum" data-numeric>
            {completed.length === 0 ? (
              <span className="font-medium text-ink-muted">No refund issued</span>
            ) : (
              <>
                {completed.length} completed · {formatMoney(aed(refundedMinor))}
              </>
            )}
          </dd>
        </div>
      </dl>
      {openCount > 0 && (
        <p className="type-caption mt-2 text-ink-muted">
          {openCount} refund{openCount === 1 ? " is" : "s are"} still processing — not yet deducted.
        </p>
      )}
      <p className="type-caption mt-2 text-ink-faint">
        Transaction status tracks money; verification tracks the trusted record.
      </p>
    </Card>
  );
}

/* ---------------- payment card ---------------- */

export function PaymentCard({ receipt }: { receipt: PosReceipt }) {
  const tx = receiptTxState(receipt);
  const statusText =
    tx === "REFUNDED"
      ? "Paid · fully refunded"
      : tx === "PARTIALLY_REFUNDED"
        ? "Paid · partially refunded"
        : "Paid";
  return (
    <Card as="section" aria-label="Payment details">
      <h2 className="flex items-center gap-2 text-[0.9375rem] font-semibold">
        <CreditCard className="h-4 w-4 text-ink-muted" aria-hidden="true" />
        Payment
      </h2>
      <dl className="mt-3 space-y-2">
        <div className="flex justify-between gap-3">
          <dt className="type-small text-ink-muted">Method</dt>
          <dd className="type-small text-right font-semibold">{PAYMENT_METHOD_LABEL[receipt.paymentMethod]}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="type-small text-ink-muted">Status</dt>
          <dd className="type-status inline-flex items-center gap-1.5 rounded-full bg-[var(--r-verified-muted)] px-2.5 py-1 text-[var(--r-verified)]">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            {statusText}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="type-small text-ink-muted">Reference</dt>
          <dd className="type-small text-right font-semibold" data-mono>
            {receipt.transactionId}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="type-small text-ink-muted">Date</dt>
          <dd className="type-small text-right font-semibold tnum">{formatDateTime(receipt.issuedAt)}</dd>
        </div>
      </dl>
      <p className="type-caption mt-3 rounded-xl bg-background px-3.5 py-2.5 text-ink-muted">
        Payment was processed by {receipt.merchant} at checkout.
      </p>
    </Card>
  );
}

/* ---------------- verification card ---------------- */

export function VerificationCard({ receipt }: { receipt: PosReceipt }) {
  const { toast } = useToast();
  const [checking, setChecking] = React.useState(false);
  const verified = receipt.verification === "VERIFIED";

  const recheck = () => {
    setChecking(true);
    window.setTimeout(() => {
      setChecking(false);
      toast({
        title: verified ? "Still verified" : "Still unavailable",
        description: verified
          ? "The record matches the trusted copy."
          : "The verification service could not be reached.",
        tone: verified ? "success" : "error",
      });
    }, 1200);
  };

  return (
    <Card as="section" aria-label="Verification">
      <div className="flex items-start gap-3">
        <span
          className={
            verified
              ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--r-verified-muted)] text-[var(--r-verified)]"
              : "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--r-neutral-muted)] text-ink-muted"
          }
        >
          {verified ? (
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          ) : (
            <CircleDashed className="h-5 w-5" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0">
          <h2 className="text-[0.9375rem] font-semibold">
            {verified ? "✓ Receipt verified" : "Verification unavailable"}
          </h2>
          <p className="type-small mt-0.5 text-ink-muted">
            {verified
              ? "This receipt matches the trusted Receipti record."
              : "We couldn't reach the verification service. Your receipt and payment status are unaffected."}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <VerificationStatusBadge status={receipt.verification} />
        <span className="flex-1" />
        <button
          type="button"
          onClick={recheck}
          disabled={checking}
          className="type-small inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-medium text-[var(--r-primary)] transition-colors hover:bg-[var(--r-primary-muted)] disabled:opacity-50"
        >
          {checking && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
          {checking ? "Checking…" : "Check again"}
        </button>
      </div>
      <Link href={`/verify/${receipt.reference}`} className="mt-3 block">
        <Button variant="outline" size="sm" className="w-full" rightIcon={<ArrowUpRight className="h-4 w-4" aria-hidden="true" />}>
          View verification details
        </Button>
      </Link>
    </Card>
  );
}

/* ---------------- details card (merchant + metadata) ---------------- */

export function DetailsCard({ receipt }: { receipt: PosReceipt }) {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(receipt.reference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast({ title: "Copy unavailable", description: "Select the reference manually.", tone: "error" });
    }
  };

  return (
    <Card as="section" aria-label="Merchant and receipt details">
      <h2 className="flex items-center gap-2 text-[0.9375rem] font-semibold">
        <Store className="h-4 w-4 text-ink-muted" aria-hidden="true" />
        Details
      </h2>
      <dl className="mt-3 space-y-2">
        <div className="flex justify-between gap-3">
          <dt className="type-small text-ink-muted">Merchant</dt>
          <dd className="type-small text-right font-semibold">{receipt.merchant}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="type-small text-ink-muted">Branch</dt>
          <dd className="type-small text-right font-semibold">{receipt.branch}</dd>
        </div>
        {receipt.customerName && (
          <div className="flex justify-between gap-3">
            <dt className="type-small text-ink-muted">Customer</dt>
            <dd className="type-small text-right font-semibold">{receipt.customerName}</dd>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <dt className="type-small text-ink-muted">Receipt ID</dt>
          <dd className="type-small text-right font-semibold" data-mono>
            {receipt.id}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="type-small text-ink-muted">Transaction</dt>
          <dd className="type-small text-right font-semibold" data-mono>
            {receipt.transactionId}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="type-small text-ink-muted">Issued</dt>
          <dd className="type-small text-right font-semibold tnum">{formatDateTime(receipt.issuedAt)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line pt-2.5">
          <dt className="type-small text-ink-muted">Reference</dt>
          <dd className="flex items-center gap-1.5">
            <span className="type-small font-bold" data-mono>
              {receipt.reference}
            </span>
            <button
              type="button"
              onClick={copyReference}
              aria-label={copied ? "Reference copied" : "Copy receipt reference"}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-[var(--r-primary-muted)] hover:text-[var(--r-primary)]"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-[var(--r-verified)]" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
          </dd>
        </div>
      </dl>
    </Card>
  );
}

/* ---------------- returns card + modal ---------------- */

export function ReturnsCard({
  receipt,
  onReceiptChange,
}: {
  receipt: PosReceipt;
  onReceiptChange: (updated: PosReceipt) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [approvingId, setApprovingId] = React.useState<string | null>(null);
  const { toast } = useToast();
  const refunds = receipt.refunds ?? [];
  const remaining = refundableMinorTotal(receipt);
  const fullyRefunded = remaining <= 0;

  const approve = (refundId: string) => {
    setApprovingId(refundId);
    const processing = updateRefundStatus(receipt, refundId, "PROCESSING");
    saveReceipt(processing);
    onReceiptChange(processing);
    window.setTimeout(() => {
      const done = updateRefundStatus(processing, refundId, "COMPLETED");
      saveReceipt(done);
      onReceiptChange(done);
      setApprovingId(null);
      toast({ title: "Refund approved", description: `${refundId} completed (demo).`, tone: "success" });
    }, 1200);
  };

  return (
    <>
      <Card as="section" aria-label="Returns and refunds" id="refunds" className="scroll-mt-24">
        <h2 className="flex items-center gap-2 text-[0.9375rem] font-semibold">
          <Undo2 className="h-4 w-4 text-ink-muted" aria-hidden="true" />
          Returns & refunds
        </h2>
        <p className="type-small mt-1.5 text-ink-muted">
          This digital receipt is your proof of purchase. Return eligibility depends on
          the merchant&apos;s policy.
        </p>
        {refunds.length > 0 ? (
          <div className="mt-4">
            <RefundHistory receipt={receipt} onApprove={approve} approvingId={approvingId} />
          </div>
        ) : (
          <p role="note" className="type-small mt-4 rounded-xl bg-background px-3.5 py-2.5 text-ink-muted">
            No refund issued for this receipt — the full amount stays with the merchant.
          </p>
        )}
        <div className="no-print mt-4 flex flex-col gap-2">
          {fullyRefunded ? (
            <p role="note" className="rounded-xl bg-background px-3.5 py-2.5 text-center text-sm font-medium text-ink-muted">
              Fully refunded — no further refunds available.
            </p>
          ) : (
            <Button className="w-full" onClick={() => setWizardOpen(true)}>
              Request return / refund
            </Button>
          )}
          <Button variant="outline" size="sm" className="w-full" onClick={() => setOpen(true)}>
            View return information
          </Button>
        </div>
      </Card>

      <RefundWizard
        receipt={receipt}
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onComplete={onReceiptChange}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Return information"
        description={`${receipt.merchant} · ${receipt.id}`}
        footer={
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="type-small text-ink-muted">
            Show this receipt — or its reference{" "}
            <span className="font-semibold text-ink" data-mono>
              {receipt.reference}
            </span>{" "}
            — when requesting a return. The merchant checks it against the trusted
            record.
          </p>
          <div className="flex flex-wrap gap-2">
            <TransactionStatusBadge status={refunds.length > 0 && refunds.reduce((s, r) => s + r.amountMinor, 0) >= receipt.totalMinor ? "REFUNDED" : "PAID"} />
            {refunds.length > 0 &&
              refunds.reduce((s, r) => s + r.amountMinor, 0) < receipt.totalMinor && (
                <span className="type-status inline-flex items-center gap-1.5 rounded-full bg-[var(--r-warning-muted)] px-2.5 py-1 text-[var(--r-warning)]">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" /> Partial refund recorded
                </span>
              )}
          </div>
          <p className="type-caption rounded-xl bg-background px-3.5 py-2.5 text-ink-muted">
            Demo only — no real return is filed. Whether a return is accepted always
            depends on the merchant&apos;s policy.
          </p>
        </div>
      </Modal>
    </>
  );
}

/* ---------------- deprecated alias ---------------- */

/** @deprecated Phase 08 merged merchant info into {@link DetailsCard}. */
export const MerchantCard = DetailsCard;

export { Rise };
