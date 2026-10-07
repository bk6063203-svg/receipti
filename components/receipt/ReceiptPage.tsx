"use client";

import * as React from "react";
import { Bookmark, BookmarkCheck, Share2 } from "lucide-react";
import type { PosReceipt } from "@/types/pos";
import { DEMO_RECEIPT_HERO, SYNC_DEMO_REF } from "@/data/pos-demo-receipts";
import { loadReceipt } from "@/lib/receipt-loader";
import { withResolvedMedia } from "@/lib/pos-media";
import { Button } from "@/components/ui";
import { ReceiptView } from "./ReceiptView";
import {
  ActionsCard,
  DetailsCard,
  PaymentCard,
  ReturnsCard,
  StatusCard,
  VerificationCard,
  useReceiptActions,
} from "./ReceiptRail";
import { NotFoundState, ReceiptSkeleton, SyncingState } from "./ReceiptStates";
import { Rise } from "./Rise";

type State =
  | { kind: "loading" }
  | { kind: "found"; receipt: PosReceipt }
  | { kind: "syncing" }
  | { kind: "not-found" };

function LoadedReceipt({ receipt: initial }: { receipt: PosReceipt }) {
  const [receipt, setReceipt] = React.useState(initial);
  const actions = useReceiptActions(receipt);
  return (
    <>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Rise className="min-w-0 lg:row-span-6">
          <ReceiptView receipt={receipt} />
        </Rise>
        <Rise delay={0.08} className="min-w-0">
          <ActionsCard receipt={receipt} actions={actions} />
        </Rise>
        <Rise delay={0.12} className="min-w-0">
          <StatusCard receipt={receipt} />
        </Rise>
        <Rise delay={0.14} className="min-w-0">
          <PaymentCard receipt={receipt} />
        </Rise>
        <Rise delay={0.16} className="min-w-0">
          <VerificationCard receipt={receipt} />
        </Rise>
        <Rise delay={0.18} className="min-w-0">
          <ReturnsCard receipt={receipt} onReceiptChange={setReceipt} />
        </Rise>
        <Rise delay={0.2} className="min-w-0">
          <DetailsCard receipt={receipt} />
        </Rise>
      </div>

      {/* Sticky mobile actions */}
      <div className="no-print sticky bottom-4 z-30 mt-5 lg:hidden">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Button
            size="lg"
            variant={actions.saved ? "secondary" : "primary"}
            className="shadow-pop"
            onClick={actions.toggleSave}
            leftIcon={
              actions.saved ? (
                <BookmarkCheck className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Bookmark className="h-5 w-5" aria-hidden="true" />
              )
            }
          >
            {actions.saved ? "Saved" : "Save to Wallet"}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="bg-[var(--r-card)] shadow-pop"
            onClick={actions.share}
            aria-label="Share receipt"
          >
            <Share2 className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </>
  );
}

export function ReceiptPage({ reference }: { reference: string }) {
  const [state, setState] = React.useState<State>({ kind: "loading" });
  const [announcement, setAnnouncement] = React.useState("Retrieving your receipt.");

  const load = React.useCallback(async (ref: string) => {
    setState({ kind: "loading" });
    setAnnouncement("Retrieving your receipt.");
    const result = await loadReceipt(ref);
    if (result.kind === "found") {
      setState({ kind: "found", receipt: result.receipt });
      setAnnouncement(`Receipt ${result.receipt.id} from ${result.receipt.merchant} loaded.`);
    } else if (result.kind === "syncing") {
      setState({ kind: "syncing" });
      setAnnouncement("Receipt is still processing.");
    } else {
      setState({ kind: "not-found" });
      setAnnouncement("Receipt not found.");
    }
  }, []);

  React.useEffect(() => {
    load(reference);
  }, [reference, load]);

  // Sync demo: simulate the receipt finishing creation after a few seconds.
  React.useEffect(() => {
    if (state.kind !== "syncing" || reference !== SYNC_DEMO_REF) return;
    const t = window.setTimeout(() => {
      const receipt = withResolvedMedia(DEMO_RECEIPT_HERO);
      setState({ kind: "found", receipt });
      setAnnouncement(`Receipt ${receipt.id} from ${receipt.merchant} loaded.`);
      window.history.replaceState(null, "", `/receipt/${receipt.reference}`);
    }, 4500);
    return () => window.clearTimeout(t);
  }, [state.kind, reference]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <div aria-live="polite" role="status" className="sr-only">
        {announcement}
      </div>
      {state.kind === "loading" && <ReceiptSkeleton />}
      {state.kind === "syncing" && <SyncingState />}
      {state.kind === "not-found" && (
        <NotFoundState reference={reference} onRetry={() => load(reference)} />
      )}
      {state.kind === "found" && <LoadedReceipt key={state.receipt.reference} receipt={state.receipt} />}
    </div>
  );
}
