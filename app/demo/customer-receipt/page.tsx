import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CloudOff, Loader2, ScanSearch, SearchX, Undo2 } from "lucide-react";
import { DEMO_RECEIPTS, SYNC_DEMO_REF } from "@/data/pos-demo-receipts";
import { receiptTxState } from "@/lib/pos";
import { Badge, Button, Card, CardDescription, CardHeader, CardTitle, PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Customer receipt demo",
  description: "Open demo customer receipts in every supported state.",
};

const STATE_COPY: Record<string, { icon: typeof Undo2; text: string; tone: "success" | "info" | "warning" | "neutral" }> = {
  PAID: { icon: ScanSearch, text: "Paid, awaiting check", tone: "neutral" },
  PARTIALLY_REFUNDED: { icon: Undo2, text: "Partially refunded", tone: "warning" },
  REFUNDED: { icon: Undo2, text: "Refunded · still authentic", tone: "info" },
};

export default function CustomerReceiptDemoPage() {
  return (
    <div className="container-x section-y flex flex-col gap-8">
      <PageHeader
        title="Customer receipt demo"
        description="One demo receipt per supported state. Everything runs locally — scan a state to see exactly what the customer sees."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Demo", href: "/demo" },
          { label: "Customer receipt" },
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DEMO_RECEIPTS.map((r) => {
          const tx = receiptTxState(r);
          const meta = STATE_COPY[tx] ?? STATE_COPY.PAID!;
          return (
            <Card key={r.reference} as="article" hover className="flex flex-col">
              <CardHeader>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--r-primary-muted)] text-[var(--r-primary)]">
                  <meta.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <Badge tone={r.verification === "VERIFIED" ? "success" : "neutral"} dot>
                  {r.verification === "VERIFIED" ? "Verified" : "Unavailable"}
                </Badge>
              </CardHeader>
              <CardTitle>
                {r.merchant} · <span data-mono>{r.reference}</span>
              </CardTitle>
              <CardDescription>
                {meta.text} · {r.lines.reduce((n, l) => n + l.quantity, 0)} items ·{" "}
                <span className="tnum">
                  AED {(r.totalMinor / 100).toFixed(2)}
                </span>
              </CardDescription>
              <div className="mt-5">
                <Link href={`/receipt/${r.reference}`}>
                  <Button className="w-full" rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
                    Open receipt
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}

        <Card as="article" hover className="flex flex-col">
          <CardHeader>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--r-info-muted)] text-[var(--r-info)]">
              <Loader2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <Badge tone="info">Syncing</Badge>
          </CardHeader>
          <CardTitle>Still processing</CardTitle>
          <CardDescription>
            The sale exists but the receipt is being created — resolves live after a few seconds.
          </CardDescription>
          <div className="mt-5">
            <Link href={`/receipt/${SYNC_DEMO_REF}`}>
              <Button variant="outline" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
                Open receipt
              </Button>
            </Link>
          </div>
        </Card>

        <Card as="article" hover className="flex flex-col">
          <CardHeader>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-background text-ink-muted">
              <SearchX className="h-5 w-5" aria-hidden="true" />
            </span>
            <Badge tone="neutral">Not found</Badge>
          </CardHeader>
          <CardTitle>Unknown reference</CardTitle>
          <CardDescription>
            Shows the polished record-not-found state with retry — never an accusation.
          </CardDescription>
          <div className="mt-5">
            <Link href="/receipt/RCP_UNKNOWN">
              <Button variant="outline" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
                Open receipt
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <p className="type-small flex items-center gap-2 text-ink-faint">
        <CloudOff className="h-4 w-4" aria-hidden="true" />
        Tip: create your own sale in the Merchant POS demo, then open its QR — it lands on this same receipt page.
      </p>
    </div>
  );
}
