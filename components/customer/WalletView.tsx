"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, EyeOff, Wallet } from "lucide-react";
import { listStoredReceipts } from "@/lib/pos-store";
import { getSavedRefs, setReceiptSaved } from "@/lib/wallet-store";
import { allReceipts, type AdminReceiptRow } from "@/lib/admin";
import { Button, Card, EmptyState, LoadingState, PageHeader } from "@/components/ui";
import { ReceiptRow } from "./ReceiptRow";

export default function WalletView() {
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<AdminReceiptRow[]>([]);
  const [saved, setSaved] = React.useState<string[]>([]);

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      setRows(allReceipts(listStoredReceipts()));
      setSaved(getSavedRefs());
      setLoading(false);
    }, 350);
    return () => window.clearTimeout(t);
  }, []);

  const toggleSave = (reference: string) => {
    setSaved((prev) => [...setReceiptSaved(reference, !prev.includes(reference))]);
  };

  const savedRows = rows.filter((r) => saved.includes(r.receipt.reference));

  return (
    <div className="container-x section-y flex flex-col gap-6">
      <PageHeader
        title="Receipt wallet"
        description="Receipts you saved — always at hand for returns and records."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Customer", href: "/customer" },
          { label: "Wallet" },
        ]}
      />

      {loading ? (
        <LoadingState variant="skeleton" lines={5} label="Loading wallet…" />
      ) : savedRows.length === 0 ? (
        <EmptyState
          icon={<Wallet className="h-8 w-8" aria-hidden="true" />}
          title="Wallet is empty"
          description="Save receipts from your receipts list and they will wait for you here."
          action={
            <Link href="/customer/receipts">
              <Button rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
                Browse receipts
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          <p className="type-small text-ink-muted tnum" role="status" aria-live="polite">
            {savedRows.length} saved receipt{savedRows.length === 1 ? "" : "s"}
          </p>
          <ul className="flex flex-col gap-2" aria-label="Saved receipts">
            {savedRows.map((r) => (
              <li key={r.receipt.reference}>
                <ReceiptRow receipt={r.receipt} saved onToggleSave={toggleSave} />
              </li>
            ))}
          </ul>
          <Card className="flex items-start gap-3">
            <EyeOff className="h-5 w-5 shrink-0 text-ink-faint" aria-hidden="true" />
            <p className="type-small text-ink-muted">
              Removing a receipt only hides it from your wallet — the trusted Receipti
              record stays intact for the merchant.
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
