import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Check,
  Fuel,
  Plug,
  ReceiptText,
  ScanSearch,
  ShoppingBag,
  Store,
  type LucideIcon,
} from "lucide-react";
import { Badge, Button, Card, CardDescription, CardHeader, CardTitle, PageHeader } from "@/components/ui";
import { GlobalSearch } from "@/components/demo/GlobalSearch";

export const metadata: Metadata = {
  title: "Demo",
  description:
    "Three connected demos on one dataset: shop and pay as a customer, run the till and approve refunds as a merchant, and watch the admin get notified.",
};

interface Demo {
  icon: LucideIcon;
  num: string;
  role: string;
  title: string;
  text: string;
  steps: string[];
  href: string;
  cta: string;
  time: string;
}

const DEMOS: Demo[] = [
  {
    icon: ShoppingBag,
    num: "01",
    role: "Customer",
    title: "Shop & pay",
    text: "Browse the store, check out, and pay — no sign-in, no verification. The receipt lands in the wallet and the merchant portal at once.",
    steps: ["Add items to the bag", "Check out & pay", "Choose print, QR, or tap-to-receive", "Receipt lands in wallet + portals"],
    href: "/demo/customer",
    cta: "Start shopping",
    time: "≈ 2 min",
  },
  {
    icon: Store,
    num: "02",
    role: "Merchant",
    title: "Till & approvals",
    text: "Ring up a sale on the POS, then switch to the portal: the sale is already there — and so is the customer's refund request, waiting for approval.",
    steps: ["Complete a POS sale", "See it in the dashboard", "Approve a pending refund", "Totals update everywhere"],
    href: "/demo/merchant-pos",
    cta: "Open the till",
    time: "≈ 3 min",
  },
  {
    icon: BellRing,
    num: "03",
    role: "Admin",
    title: "Live notifications",
    text: "Keep the live feed open while the other demos run: every sale, refund request, approval, and fuel alert arrives the moment it happens.",
    steps: ["Open the live feed", "Run a sale in another tab", "Request & approve a refund", "Watch each event land"],
    href: "/demo/admin",
    cta: "Watch the feed",
    time: "≈ 2 min",
  },
];

const FLOW = ["Shop & pay", "Receipt issued", "Saved to wallet", "Refund requested", "Merchant approves", "Admin notified"];

const MORE: { icon: LucideIcon; title: string; href: string }[] = [
  { icon: Fuel, title: "Fuel check", href: "/demo/fuel" },
  { icon: ScanSearch, title: "Verify a slip", href: "/verify" },
  { icon: ReceiptText, title: "Receipt index", href: "/demo/customer-receipt" },
  { icon: Plug, title: "Integration", href: "/merchant/integration" },
];

export default function DemoPage() {
  return (
    <div className="container-x section-y flex flex-col gap-10">
      <PageHeader
        title="Three demos, one dataset"
        description="Shop as a customer, run the till and approve refunds as a merchant, and watch the admin get notified — every demo reads and writes the same receipts."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Demo" }]}
      />

      <section aria-label="Search demo receipts" className="mx-auto w-full max-w-2xl">
        <GlobalSearch />
      </section>

      <section aria-label="Demos">
        <p className="type-label text-[var(--r-primary)]">End-to-end journeys</p>
        <h2 className="type-h2 mt-1">Pick a role, play it through</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {DEMOS.map((d) => (
            <Card key={d.num} as="article" hover className="flex flex-col">
              <CardHeader>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--r-primary-muted)] text-[var(--r-primary)]">
                  <d.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="flex items-center gap-2">
                  <Badge tone="success" dot>Live</Badge>
                  <span className="type-caption font-bold text-ink-faint tnum">{d.time}</span>
                </span>
              </CardHeader>
              <p className="type-caption font-bold text-[var(--r-primary)]">
                Demo {d.num} · {d.role}
              </p>
              <CardTitle className="mt-1">{d.title}</CardTitle>
              <CardDescription className="mt-1">{d.text}</CardDescription>
              <ol className="mt-4 flex flex-col gap-1.5">
                {d.steps.map((s, i) => (
                  <li key={s} className="flex items-center gap-2 text-sm text-ink-muted">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-background text-[0.6875rem] font-bold text-ink-faint tnum" aria-hidden="true">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
              <div className="mt-5 flex-1" />
              <Link href={d.href}>
                <Button className="w-full" rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
                  {d.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section aria-label="How the demos connect">
        <p className="type-label text-[var(--r-primary)]">One shared engine</p>
        <h2 className="type-h2 mt-1">How they connect</h2>
        <p className="type-small mt-1 max-w-2xl text-ink-muted">
          Run them in order and each demo picks up where the last one left off — same receipts, same refunds, same events.
        </p>
        <ol className="mt-4 flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
          {FLOW.map((f, i) => (
            <li key={f} className="flex items-center gap-2">
              {i > 0 && (
                <ArrowRight className="h-4 w-4 rotate-90 text-ink-faint md:rotate-0" aria-hidden="true" />
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-[var(--r-card)] px-3.5 py-2 text-sm font-semibold">
                <Check className="h-3.5 w-3.5 text-[var(--r-verified)]" aria-hidden="true" />
                {f}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-label="More from the prototype">
        <h2 className="type-h3">More from the prototype</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MORE.map((m) => (
            <Link
              key={m.title}
              href={m.href}
              className="group flex items-center gap-3 rounded-2xl border border-line bg-[var(--r-card)] p-4 transition-colors hover:border-[var(--r-primary)]"
            >
              <m.icon className="h-5 w-5 shrink-0 text-ink-faint transition-colors group-hover:text-[var(--r-primary)]" aria-hidden="true" />
              <span className="text-sm font-bold">{m.title}</span>
              <ArrowRight className="ml-auto h-4 w-4 text-ink-faint transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <Card as="section" aria-label="Continue exploring" className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <ReceiptText className="h-8 w-8 shrink-0 text-[var(--r-primary)]" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h2 className="type-h3">Or skip straight to the portals</h2>
          <p className="type-small mt-0.5 text-ink-muted">
            The customer wallet, merchant dashboard, and admin overview all read the same data the demos create.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Link href="/customer">
            <Button className="w-full sm:w-auto">Customer portal</Button>
          </Link>
          <Link href="/merchant">
            <Button variant="outline" className="w-full sm:w-auto">Merchant portal</Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline" className="w-full sm:w-auto">Admin portal</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
