"use client";

import * as React from "react";
import { ReceiptText, Trash2, Wallet } from "lucide-react";
import { formatDateTime, formatMoney } from "@/lib/format";
import {
  LIVE_DEMO_CUSTOMER_ID,
  LIVE_DEMO_CUSTOMER_NAME,
  type ReceiptRecord,
} from "@/lib/live-receipt-record";
import { pkr } from "@/lib/live-transaction";
import { DB_EVENT, getRepository } from "@/lib/receipt-repo";
import { Badge, Button, Card, EmptyState, Modal, useToast } from "@/components/ui";
import { useLive } from "./LiveProvider";
import { DbModeBadge } from "./DbModeBadge";
import { LiveReceiptCard, ReceiptStatusPill } from "./LiveReceiptCard";
import { ProductThumb } from "./ProductThumb";

interface WalletItem {
  addedAt: string;
  record: ReceiptRecord;
}

export function WalletView() {
  const { toast } = useToast();
  const { tx } = useLive();
  const [items, setItems] = React.useState<WalletItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<ReceiptRecord | null>(null);
  const seen = React.useRef<Set<string> | null>(null);

  const reload = React.useCallback(async (announce: boolean) => {
    try {
      const repo = await getRepository();
      const entries = await repo.listWallet(LIVE_DEMO_CUSTOMER_ID);
      const joined = (
        await Promise.all(
          entries.map(async (e) => {
            const record = await repo.getReceipt(e.receiptId);
            return record ? { addedAt: e.addedAt, record } : null;
          })
        )
      ).filter((x): x is WalletItem => x !== null);
      setItems(joined);
      if (announce && seen.current) {
        const fresh = joined.filter((j) => !seen.current!.has(j.record.receiptId));
        if (fresh.length > 0) {
          toast({
            title: "Receipt saved to wallet",
            description: `${fresh[0]!.record.merchantName} · ${formatMoney(pkr(fresh[0]!.record.totalMinor))}`,
            tone: "success",
          });
        }
      }
      seen.current = new Set(joined.map((j) => j.record.receiptId));
    } catch {
      /* wallet stays as-is on transient failures */
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void reload(false);
    const onMutate = () => void reload(true);
    window.addEventListener(DB_EVENT, onMutate);
    window.addEventListener("storage", onMutate);
    return () => {
      window.removeEventListener(DB_EVENT, onMutate);
      window.removeEventListener("storage", onMutate);
    };
  }, [reload]);

  // A claim on the customer display lands here automatically.
  const claimedAt = tx.receipt?.claimedAt;
  React.useEffect(() => {
    if (claimedAt) void reload(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claimedAt]);

  const remove = async (receiptId: string) => {
    try {
      const repo = await getRepository();
      await repo.hideWalletEntry(LIVE_DEMO_CUSTOMER_ID, receiptId);
      setSelected(null);
      await reload(false);
      toast({
        title: "Removed from wallet",
        description: "Your view is hidden — the original stays in Receipti's records.",
        tone: "info",
      });
    } catch {
      toast({ title: "Couldn't remove it", description: "Please try again.", tone: "error" });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--r-primary-muted)] text-[var(--r-primary)]">
          <Wallet className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="type-h1">Receipti Wallet</h1>
          <p className="type-caption mt-0.5 text-ink-muted">
            {LIVE_DEMO_CUSTOMER_NAME} · Demo customer — sign-in is out of scope for the prototype.
          </p>
        </div>
        <DbModeBadge />
        <Badge className="tnum">{items.length} receipt{items.length === 1 ? "" : "s"}</Badge>
      </div>

      {loading ? (
        <Card aria-busy="true" aria-label="Loading wallet">
          <div className="flex animate-pulse flex-col gap-3">
            <div className="h-16 rounded-xl bg-background" />
            <div className="h-16 rounded-xl bg-background" />
          </div>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ReceiptText className="h-8 w-8" aria-hidden="true" />}
            title="No receipts yet"
            description="Claim a receipt from the customer display after paying — it lands here automatically."
          />
        </Card>
      ) : (
        <ul className="flex flex-col gap-3" aria-label="Wallet receipts">
          {items.map(({ record: r }) => (
            <li key={r.receiptId}>
              <Card className="flex flex-wrap items-center gap-4">
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold">{r.merchantName}</p>
                    <ReceiptStatusPill status={r.receiptStatus} />
                  </div>
                  <div className="flex items-center gap-2">
                    {r.lines.slice(0, 4).map((l) => (
                      <ProductThumb key={l.sku} image={l.image} name={l.name} size={40} />
                    ))}
                    {r.lines.length > 4 && (
                      <span className="type-caption font-bold text-ink-faint tnum">+{r.lines.length - 4}</span>
                    )}
                  </div>
                  <p className="type-caption text-ink-muted tnum">
                    {formatDateTime(r.issuedAt)} · {r.lines.reduce((n, l) => n + l.quantity, 0)} items ·{" "}
                    <span className="font-mono" data-mono>{r.receiptId}</span>
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <p className="text-lg font-bold tnum" data-numeric>{formatMoney(pkr(r.totalMinor))}</p>
                  <Button size="sm" variant="outline" onClick={() => setSelected(r)}>
                    View details
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `Receipt ${selected.receiptId}` : "Receipt"}
        description="Your wallet copy — the original cannot be edited from here."
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => selected && void remove(selected.receiptId)}
              leftIcon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
            >
              Remove from wallet
            </Button>
            <Button onClick={() => setSelected(null)}>Close</Button>
          </>
        }
      >
        {selected && <LiveReceiptCard record={selected} />}
      </Modal>
    </div>
  );
}
