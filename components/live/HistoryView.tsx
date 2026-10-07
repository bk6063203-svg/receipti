"use client";

import * as React from "react";
import { AlertTriangle, ReceiptText, RotateCcw, Undo2, X } from "lucide-react";
import { LIVE_MERCHANT_ID, LIVE_MERCHANT } from "@/data/live-catalog";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { AuditEvent, ReceiptRecord } from "@/lib/live-receipt-record";
import { pkr } from "@/lib/live-transaction";
import { DB_EVENT, getRepository } from "@/lib/receipt-repo";
import { Badge, Button, Card, EmptyState, Input, Modal, useToast } from "@/components/ui";
import { DbModeBadge } from "./DbModeBadge";
import { LiveReceiptCard, ReceiptStatusPill } from "./LiveReceiptCard";

type ArmedAction = "refund-all" | "void" | null;

export function HistoryView() {
  const { toast } = useToast();
  const [rows, setRows] = React.useState<ReceiptRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<ReceiptRecord | null>(null);
  const [audit, setAudit] = React.useState<AuditEvent[]>([]);
  const [armed, setArmed] = React.useState<ArmedAction>(null);
  const [partialInput, setPartialInput] = React.useState("");
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [acting, setActing] = React.useState(false);

  const reload = React.useCallback(async () => {
    try {
      const repo = await getRepository();
      setRows(await repo.listMerchantReceipts(LIVE_MERCHANT_ID));
    } catch {
      /* list stays as-is on transient failures */
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void reload();
    const onMutate = () => void reload();
    window.addEventListener(DB_EVENT, onMutate);
    window.addEventListener("storage", onMutate);
    return () => {
      window.removeEventListener(DB_EVENT, onMutate);
      window.removeEventListener("storage", onMutate);
    };
  }, [reload]);

  const openRow = async (r: ReceiptRecord) => {
    setSelected(r);
    setArmed(null);
    setPartialInput("");
    setActionError(null);
    try {
      const repo = await getRepository();
      setAudit(await repo.listAudit(r.receiptId));
    } catch {
      setAudit([]);
    }
  };

  const refreshSelected = async (receiptId: string) => {
    try {
      const repo = await getRepository();
      const [record, trail] = await Promise.all([
        repo.getReceipt(receiptId),
        repo.listAudit(receiptId),
      ]);
      if (record) setSelected(record);
      setAudit(trail);
      await reload();
    } catch {
      /* best-effort */
    }
  };

  const runRefund = async (amount: number | "all") => {
    if (!selected || acting) return;
    setActing(true);
    setActionError(null);
    try {
      const repo = await getRepository();
      const outcome = await repo.applyRefund(selected.receiptId, amount);
      if ("error" in outcome) {
        setActionError(outcome.error);
        return;
      }
      const refunded = outcome.record.refundedMinor - selected.refundedMinor;
      await repo.appendAudit({
        receiptId: selected.receiptId,
        type: "REFUND",
        detail:
          outcome.record.receiptStatus === "REFUNDED"
            ? `Full refund of ${formatMoney(pkr(outcome.record.totalMinor))}`
            : `Partial refund of ${formatMoney(pkr(refunded))}`,
        amountMinor: refunded,
        actor: "merchant",
      });
      setArmed(null);
      setPartialInput("");
      await refreshSelected(selected.receiptId);
      toast({ title: "Refund recorded", description: "Saved as a separate audit event — the original is untouched.", tone: "success" });
    } catch {
      setActionError("The refund couldn't be recorded. Please try again.");
    } finally {
      setActing(false);
    }
  };

  const runVoid = async () => {
    if (!selected || acting) return;
    setActing(true);
    setActionError(null);
    try {
      const repo = await getRepository();
      const outcome = await repo.applyVoid(selected.receiptId);
      if ("error" in outcome) {
        setActionError(outcome.error);
        return;
      }
      await repo.appendAudit({
        receiptId: selected.receiptId,
        type: "VOID",
        detail: "Receipt voided by merchant",
        amountMinor: null,
        actor: "merchant",
      });
      setArmed(null);
      await refreshSelected(selected.receiptId);
      toast({ title: "Receipt voided", description: "Recorded as a separate audit event.", tone: "success" });
    } catch {
      setActionError("The receipt couldn't be voided. Please try again.");
    } finally {
      setActing(false);
    }
  };

  const remaining = selected ? selected.totalMinor - selected.refundedMinor : 0;
  const actionable = selected && (selected.receiptStatus === "VALID" || selected.receiptStatus === "PARTIAL");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--r-primary-muted)] text-[var(--r-primary)]">
          <ReceiptText className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="type-h1">Receipt history</h1>
          <p className="type-caption mt-0.5 text-ink-muted">
            {LIVE_MERCHANT} · receipts for this account only — merchant scoping is enforced.
          </p>
        </div>
        <DbModeBadge />
        <Button size="sm" variant="outline" onClick={() => void reload()} leftIcon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}>
          Reload
        </Button>
      </div>

      {loading ? (
        <Card aria-busy="true" aria-label="Loading history">
          <div className="flex animate-pulse flex-col gap-3">
            <div className="h-14 rounded-xl bg-background" />
            <div className="h-14 rounded-xl bg-background" />
          </div>
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ReceiptText className="h-8 w-8" aria-hidden="true" />}
            title="No receipts issued yet"
            description="Complete a sale on the till — the finalized receipt lands here."
          />
        </Card>
      ) : (
        <ul className="flex flex-col gap-2.5" aria-label="Issued receipts">
          {rows.map((r) => (
            <li key={r.receiptId}>
              <button
                type="button"
                onClick={() => void openRow(r)}
                className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-line bg-[var(--r-card)] px-4 py-3.5 text-left shadow-subtle transition-colors hover:border-[var(--r-primary)]"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-sm font-bold" data-mono>{r.receiptId}</span>
                  <span className="type-caption mt-0.5 block text-ink-muted tnum">
                    {formatDateTime(r.issuedAt)} · {r.transactionId} · {r.lines.reduce((n, l) => n + l.quantity, 0)} items
                  </span>
                </span>
                <ReceiptStatusPill status={r.receiptStatus} />
                <Badge tone={r.claimedAt ? "success" : "neutral"}>
                  {r.claimedAt ? "Claimed" : "Unclaimed"}
                </Badge>
                <span className="text-base font-bold tnum" data-numeric>{formatMoney(pkr(r.totalMinor))}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `Receipt ${selected.receiptId}` : "Receipt"}
        description="The original record is read-only — refunds and voids are separate audit events."
        size="lg"
        footer={<Button onClick={() => setSelected(null)}>Close</Button>}
      >
        {selected && (
          <div className="flex flex-col gap-5">
            <LiveReceiptCard record={selected} showCustomer />

            <section aria-label="Audit trail">
              <h3 className="type-h4">Audit trail</h3>
              {audit.length === 0 ? (
                <p className="type-small mt-1.5 text-ink-muted">No events recorded yet.</p>
              ) : (
                <ol className="mt-2 flex flex-col gap-1.5">
                  {audit.map((a) => (
                    <li key={a.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-background px-3.5 py-2.5">
                      <Badge tone={a.type === "ISSUED" ? "success" : a.type === "CLAIMED" ? "info" : a.type === "VOID" ? "danger" : "warning"}>
                        {a.type}
                      </Badge>
                      <span className="type-small min-w-0 flex-1 text-ink-muted">{a.detail}</span>
                      {a.amountMinor !== null && (
                        <span className="type-small font-bold tnum">{formatMoney(pkr(a.amountMinor))}</span>
                      )}
                      <span className="type-caption text-ink-faint tnum">{formatDateTime(a.at)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            {actionable ? (
              <section aria-label="Refund or void" className="flex flex-col gap-2.5 rounded-2xl border border-line p-4">
                <h3 className="type-h4">Refund / void</h3>
                {selected.receiptStatus === "VALID" && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={armed === "refund-all" ? "primary" : "outline"}
                      disabled={acting}
                      onClick={() => (armed === "refund-all" ? void runRefund("all") : setArmed("refund-all"))}
                      leftIcon={<Undo2 className="h-4 w-4" aria-hidden="true" />}
                    >
                      {armed === "refund-all" ? "Click again to confirm full refund" : `Refund all · ${formatMoney(pkr(selected.totalMinor))}`}
                    </Button>
                    <Button
                      size="sm"
                      variant={armed === "void" ? "primary" : "outline"}
                      disabled={acting}
                      onClick={() => (armed === "void" ? void runVoid() : setArmed("void"))}
                      leftIcon={<X className="h-4 w-4" aria-hidden="true" />}
                    >
                      {armed === "void" ? "Click again to confirm void" : "Void receipt"}
                    </Button>
                  </div>
                )}
                {selected.receiptStatus === "PARTIAL" && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={armed === "refund-all" ? "primary" : "outline"}
                      disabled={acting}
                      onClick={() => (armed === "refund-all" ? void runRefund("all") : setArmed("refund-all"))}
                      leftIcon={<Undo2 className="h-4 w-4" aria-hidden="true" />}
                    >
                      {armed === "refund-all" ? "Click again to confirm" : `Refund remaining · ${formatMoney(pkr(remaining))}`}
                    </Button>
                  </div>
                )}
                {selected.receiptStatus === "VALID" && (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <Input
                        label="Partial refund amount (PKR)"
                        placeholder="e.g. 1500"
                        value={partialInput}
                        inputMode="numeric"
                        autoComplete="off"
                        disabled={acting}
                        onChange={(e) => setPartialInput(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      disabled={acting}
                      onClick={() => {
                        const rupees = Math.floor(Number(partialInput) || 0);
                        if (rupees <= 0) {
                          setActionError("Enter an amount greater than zero.");
                          return;
                        }
                        if (rupees * 100 > remaining) {
                          setActionError(`Only ${formatMoney(pkr(remaining))} remains refundable.`);
                          return;
                        }
                        void runRefund(rupees * 100);
                      }}
                    >
                      Refund amount
                    </Button>
                  </div>
                )}
                {actionError && (
                  <p role="alert" className="flex items-start gap-2 rounded-xl bg-[var(--r-danger-muted)] px-3.5 py-2.5 text-sm font-medium text-[var(--r-danger)]">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {actionError}
                  </p>
                )}
              </section>
            ) : (
              <p className="type-small rounded-xl bg-background px-4 py-3 text-ink-muted">
                No further actions — this receipt is {selected.receiptStatus === "VOIDED" ? "voided" : "fully refunded"}. The audit trail above is the permanent record.
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
