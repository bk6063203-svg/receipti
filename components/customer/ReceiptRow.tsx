"use client";

import * as React from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck, Check, Copy } from "lucide-react";
import type { PosReceipt } from "@/types/pos";
import { receiptTxState } from "@/lib/pos";
import { formatDate, formatMoney } from "@/lib/format";
import { Card } from "@/components/ui";
import { TxPill } from "@/components/merchant";
import { cn } from "@/lib/utils";

interface ReceiptRowProps {
  receipt: PosReceipt;
  saved: boolean;
  onToggleSave: (reference: string) => void;
}

/** Customer receipt row: opens detail, saves to wallet, shows live status. */
export function ReceiptRow({ receipt, saved, onToggleSave }: ReceiptRowProps) {
  const [copied, setCopied] = React.useState(false);

  const copyRef = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(receipt.reference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="flex items-stretch gap-2">
      <Link
        href={`/receipt/${receipt.reference}`}
        aria-label={`Open receipt ${receipt.id} from ${receipt.merchant}`}
        className="block min-w-0 flex-1 rounded-2xl"
      >
        <Card hover padding="md" className="flex h-full items-center gap-4">
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-3">
              <span className="truncate text-sm font-bold">{receipt.merchant}</span>
              <span className="shrink-0 text-[0.9375rem] font-bold tnum" data-numeric>
                {formatMoney({ amountMinor: receipt.totalMinor, currency: receipt.currency })}
              </span>
            </span>
            <span className="mt-0.5 flex items-center justify-between gap-3">
              <span className="type-caption truncate text-ink-muted" data-mono>
                {receipt.id}
              </span>
              <span className="type-caption shrink-0 text-ink-faint tnum">
                {formatDate(receipt.issuedAt)}
              </span>
            </span>
            <span className="mt-2 flex flex-wrap items-center gap-2">
              <TxPill state={receiptTxState(receipt)} />
              <button
                type="button"
                onClick={copyRef}
                aria-label={copied ? "Reference copied" : `Copy receipt reference ${receipt.reference}`}
                title="Copy reference"
                className="type-caption inline-flex items-center gap-1 rounded-md bg-background px-1.5 py-0.5 text-ink-muted transition-colors hover:text-[var(--r-primary)]"
              >
                <span data-mono>{receipt.reference}</span>
                {copied ? (
                  <Check className="h-3 w-3 text-[var(--r-verified)]" aria-hidden="true" />
                ) : (
                  <Copy className="h-3 w-3" aria-hidden="true" />
                )}
              </button>
            </span>
          </span>
        </Card>
      </Link>
      <button
        type="button"
        onClick={() => onToggleSave(receipt.reference)}
        aria-pressed={saved}
        aria-label={saved ? `Remove receipt ${receipt.id} from wallet` : `Save receipt ${receipt.id} to wallet`}
        title={saved ? "Saved in wallet" : "Save to wallet"}
        className={cn(
          "flex w-11 shrink-0 items-center justify-center rounded-2xl border transition-colors",
          saved
            ? "border-[var(--r-primary)] bg-[var(--r-primary-muted)] text-[var(--r-primary)]"
            : "border-line bg-[var(--r-card)] text-ink-faint hover:border-[var(--r-primary)] hover:text-[var(--r-primary)]"
        )}
      >
        {saved ? (
          <BookmarkCheck className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Bookmark className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
