import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  LayoutGrid,
  ReceiptText,
  ScanSearch,
  Smartphone,
  Store,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Badge, Button, Card, CardDescription, CardHeader, CardTitle, PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Live Transaction Demo",
  description:
    "One synchronized transaction across two screens: ring up the sale on the merchant POS and watch the customer display update live.",
};

interface Entry {
  icon: LucideIcon;
  title: string;
  text: string;
  href: string;
  cta: string;
  featured?: boolean;
}

const ENTRIES: Entry[] = [
  {
    icon: Store,
    title: "Merchant View",
    text: "The cashier till: search, barcode scan, quantities, discounts, and charging — in PKR.",
    href: "/live/merchant",
    cta: "Open the till",
  },
  {
    icon: Smartphone,
    title: "Customer View",
    text: "The live checkout display: scanned items, running subtotal, GST, and the payable amount.",
    href: "/live/customer",
    cta: "Open the display",
  },
  {
    icon: LayoutGrid,
    title: "Split Screen Demo",
    text: "Both screens side by side — scan on the left, watch the customer display react on the right.",
    href: "/live/split",
    cta: "Open split screen",
  },
];

const TRUST_ENTRIES: Entry[] = [
  {
    icon: Wallet,
    title: "Receipt Wallet",
    text: "Claimed receipts land here automatically — full details, product images, payment status.",
    href: "/live/wallet",
    cta: "Open the wallet",
  },
  {
    icon: ScanSearch,
    title: "Verify Receipt",
    text: "Check any receipt by ID or QR claim link — integrity-checked, with an activity log.",
    href: "/live/verify",
    cta: "Verify a receipt",
  },
  {
    icon: ReceiptText,
    title: "Receipt History",
    text: "The merchant's own finalized receipts, audit trail, refunds, and voids.",
    href: "/live/history",
    cta: "Open history",
  },
];

const STEPS = [
  "Open the merchant till and the customer display — side by side, or in two tabs",
  "Search, scan a barcode, or add items manually on the till",
  "Every scan, quantity change, and discount lands on the customer display instantly",
  "Charge the sale and both screens celebrate together",
];

export default function LiveDemoPage() {
  const remoteReady = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  return (
    <div className="container-x section-y flex flex-col gap-10">
      <PageHeader
        title="Live Transaction Demo"
        description="One transaction, two screens, zero refresh. Ring up a realistic Pakistani retail sale and watch the customer display follow every scan in real time."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Live Demo" }]}
      />

      <section aria-label="Guided demonstration">
        <Card as="article" hover className="border-[var(--r-primary)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">
              <Badge tone="success" dot>Investor pick</Badge>
              <h2 className="type-h2 mt-2">Experience a Real Transaction with Receipti</h2>
              <p className="type-small mt-1.5 max-w-2xl text-ink-muted">
                The guided end-to-end journey: scan three products on the merchant till, watch
                the customer display follow live, confirm payment, deliver the receipt — then
                verify it by Receipt ID.
              </p>
            </div>
            <Link href="/live/experience" className="shrink-0">
              <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
                Start the guided demo
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      <section aria-label="Live demo screens">
        <div className="grid gap-4 lg:grid-cols-3">
          {ENTRIES.map((e) => (
            <Card key={e.title} as="article" hover className="flex flex-col">
              <CardHeader>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--r-primary-muted)] text-[var(--r-primary)]">
                  <e.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                {e.featured ? (
                  <Badge tone="success" dot>Investor pick</Badge>
                ) : (
                  <Badge tone="success" dot>Live</Badge>
                )}
              </CardHeader>
              <CardTitle>{e.title}</CardTitle>
              <CardDescription className="flex-1">{e.text}</CardDescription>
              <div className="mt-5">
                <Link href={e.href}>
                  <Button className="w-full" rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
                    {e.cta}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section aria-label="Receipts and trust">
        <p className="type-label text-[var(--r-primary)]">After payment</p>
        <h2 className="type-h2 mt-1">Receipts &amp; trust</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {TRUST_ENTRIES.map((e) => (
            <Card key={e.title} as="article" hover className="flex flex-col">
              <CardHeader>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--r-primary-muted)] text-[var(--r-primary)]">
                  <e.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <Badge tone="success" dot>Live</Badge>
              </CardHeader>
              <CardTitle>{e.title}</CardTitle>
              <CardDescription className="flex-1">{e.text}</CardDescription>
              <div className="mt-5">
                <Link href={e.href}>
                  <Button className="w-full" rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
                    {e.cta}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section aria-label="How the demo works">
        <p className="type-label text-[var(--r-primary)]">One shared transaction</p>
        <h2 className="type-h2 mt-1">How to run it</h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-start gap-3 rounded-2xl border border-line bg-[var(--r-card)] p-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--r-primary)] text-[0.6875rem] font-bold text-white tnum" aria-hidden="true">
                {i + 1}
              </span>
              <span className="type-small text-ink-muted">{s}</span>
            </li>
          ))}
        </ol>
        <p className="type-small mt-3 flex items-start gap-1.5 text-ink-muted">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--r-verified)]" aria-hidden="true" />
          Both screens read and write the same transaction state — this is one functional
          experience, not two mockups. It even stays in sync across browser tabs.
        </p>
      </section>

      <section aria-label="Cross-device sync">
        <Card className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="type-h3">Cross-device sync</h2>
            {remoteReady ? (
              <Badge tone="success" dot>Backend connected</Badge>
            ) : (
              <Badge tone="warning">Same-browser mode</Badge>
            )}
          </div>
          {remoteReady ? (
            <p className="type-small text-ink-muted">
              Supabase Realtime is configured — the till and the display stay in sync even on
              different devices. Open each screen on its own device to present the full story.
            </p>
          ) : (
            <>
              <p className="type-small text-ink-muted">
                This demo is running in same-browser mode: the split screen and any tabs on this
                device share one live transaction. Syncing across separate devices requires a
                one-time backend setup — no tables or SQL needed (Realtime broadcast only):
              </p>
              <ol className="flex flex-col gap-1.5">
                {[
                  "Create a free project at supabase.com and copy its URL + anon key.",
                  "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local (see .env.example).",
                  "Restart the app — both screens switch to Live backend automatically.",
                ].map((step, i) => (
                  <li key={step} className="flex items-start gap-2.5 text-sm text-ink-muted">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-background text-[0.6875rem] font-bold text-ink-faint tnum" aria-hidden="true">
                      {i + 1}
                    </span>
                    <span><code className="rounded bg-background px-1 py-0.5 font-mono text-xs">{step.split(" — ")[0]}</code>{step.includes(" — ") ? ` — ${step.split(" — ").slice(1).join(" — ")}` : ""}</span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </Card>
      </section>
    </div>
  );
}
