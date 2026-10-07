import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  Check,
  FileSearch,
  Fuel,
  Hash,
  Landmark,
  ReceiptText,
  ScanSearch,
  Smartphone,
  Store,
  Undo2,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { Reveal } from "@/components/landing";

export const metadata: Metadata = {
  title: "Presentation",
  description: "The Receipti story — the problem, the solution, and the ecosystem connecting customers and merchants.",
};

const PROBLEMS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: ReceiptText,
    title: "Paper disappears",
    text: "Fades, tears, gets lost. Proof of purchase is gone exactly when a return or warranty needs it.",
  },
  {
    icon: FileSearch,
    title: "Copies can be altered",
    text: "A photo of a receipt proves little. There is no trusted record to check it against.",
  },
  {
    icon: Store,
    title: "Merchants can't respond",
    text: "Returns, warranty checks, and disputes start from scratch every time — for the shop and the customer.",
  },
];

const SOLUTION_POINTS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Smartphone,
    title: "Digital vs paper",
    text: "The receipt lives where the customer lives — on their phone — not in a drawer.",
  },
  {
    icon: Hash,
    title: "Receipt ID generation",
    text: "Every record carries a unique reference the customer can quote anywhere.",
  },
  {
    icon: ScanSearch,
    title: "Verification",
    text: "Anyone can check a reference against the trusted record in seconds.",
  },
  {
    icon: BadgeCheck,
    title: "References that travel",
    text: "One reference links the receipt, the refund, the warranty — the whole story.",
  },
];

const CUSTOMER_STEPS = [
  { step: "01", title: "Purchase complete", text: "The sale finalizes at the POS.", href: "/demo/merchant-pos" },
  { step: "02", title: "Digital receipt issued", text: "Receipti creates the trusted record.", href: "/demo/customer-receipt" },
  { step: "03", title: "Customer receives it", text: "QR, wallet, or web — always at hand.", href: "/demo/customer-receipt" },
  { step: "04", title: "Saved to wallet", text: "One tap keeps it for returns and records.", href: "/receipt/RCP_8F42K9M2" },
  { step: "05", title: "Verified any time", text: "The reference checks out on demand.", href: "/verify/RCP_8F42K9M2" },
  { step: "06", title: "Refund without friction", text: "The return links to the receipt.", href: "/receipt/RCP_3P5RT2WQ#refunds" },
  { step: "07", title: "History stays consistent", text: "Timeline, totals, status — everywhere.", href: "/receipt/RCP_3P5RT2WQ" },
];

const MERCHANT_STEPS = [
  { title: "Merchant POS", text: "The sale and payment happen in the existing system.", href: "/demo/merchant-pos" },
  { title: "Transaction completed", text: "Totals, items, and payment are final.", href: "/demo/merchant-pos" },
  { title: "Receipti integration", text: "Permitted receipt data flows to Receipti.", href: "/merchant/integration" },
  { title: "Receipt created", text: "A verifiable record exists for the customer.", href: "/demo/customer-receipt" },
  { title: "Customer receives it", text: "QR, wallet, or web — the customer is covered.", href: "/demo/customer-receipt" },
  { title: "Merchant dashboard", text: "Activity, status, and delivery at a glance.", href: "/merchant" },
  { title: "Refunds & verification", text: "Returns and checks stay linked to the record.", href: "/merchant/refunds" },
];

const ECOSYSTEM: { icon: LucideIcon; title: string; text: string; href: string; cta: string }[] = [
  {
    icon: Undo2,
    title: "Refunds system",
    text: "Returns link to the receipt as new events — nothing is rewritten, everything is traceable.",
    href: "/receipt/RCP_3P5RT2WQ#refunds",
    cta: "Open refund flow",
  },
  {
    icon: Fuel,
    title: "Fuel purchases",
    text: "Specialized receipts — litres, rate, pump — compared against the trusted record.",
    href: "/demo/fuel",
    cta: "Open fuel demo",
  },
  {
    icon: Landmark,
    title: "Institutional future",
    text: "The same verifiable receipts that serve customers today could one day support institutions, with their own wallets, roles, and audit views — a possibility being explored, not a built feature.",
    href: "/demo",
    cta: "Back to the demo",
  },
];

const IS_LIST = [
  "A trusted digital-receipt layer",
  "Customer-first record keeping",
  "Merchant-friendly integration",
  "Verification without friction",
];

const IS_NOT_LIST = [
  "Not a payment system",
  "Not a government service",
  "Not a replacement for POS systems",
  "Not live production software",
];

export default function PresentationPage() {
  return (
    <div className="flex flex-col">
      {/* 1 — Hero */}
      <section aria-label="Introduction" className="container-x section-y text-center">
        <Reveal>
          <Badge tone="info">Receipti · Story</Badge>
          <h1 className="type-display mx-auto mt-4 max-w-3xl text-balance">
            Digital receipts, trusted by everyone.
          </h1>
          <p className="type-lead mx-auto mt-3 max-w-2xl text-ink-muted">
            From the moment a sale completes to the day a return is needed — one verifiable record,
            shared by customers and merchants.
          </p>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Highlights">
            {["Verifiable records", "Customer wallet", "Merchant insight"].map((t) => (
              <li key={t}>
                <Badge tone="success" dot>
                  {t}
                </Badge>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <a href="#problem">
              <Button size="lg" rightIcon={<ArrowDown className="h-4 w-4" aria-hidden="true" />}>
                Start story
              </Button>
            </a>
          </div>
        </Reveal>
      </section>

      {/* 2 — Problem */}
      <section id="problem" aria-label="The problem" className="scroll-mt-24 border-t border-line bg-[var(--r-card)]">
        <div className="container-x section-y">
          <Reveal>
            <p className="type-label text-[var(--r-primary)]">Chapter 1</p>
            <h2 className="type-h2 mt-1">The problem with paper</h2>
            <p className="type-lead mt-2 max-w-2xl text-ink-muted">
              Proof of purchase is fragile — and both sides pay for it.
            </p>
          </Reveal>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {PROBLEMS.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <Card className="h-full">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--r-primary-muted)] text-[var(--r-primary)]">
                    <p.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="type-h4 mt-3">{p.title}</h3>
                  <p className="type-small mt-1 text-ink-muted">{p.text}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3 — Solution */}
      <section id="solution" aria-label="The solution" className="scroll-mt-24 border-t border-line">
        <div className="container-x section-y">
          <Reveal>
            <p className="type-label text-[var(--r-primary)]">Chapter 2</p>
            <h2 className="type-h2 mt-1">What Receipti actually does</h2>
            <p className="type-lead mt-2 max-w-2xl text-ink-muted">
              One trusted record per transaction — created at the POS, owned by the customer, visible to the merchant.
            </p>
          </Reveal>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {SOLUTION_POINTS.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <Card className="h-full">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--r-primary-muted)] text-[var(--r-primary)]">
                    <p.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="type-h4 mt-3">{p.title}</h3>
                  <p className="type-small mt-1 text-ink-muted">{p.text}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4 — Customer view */}
      <section id="customer" aria-label="Customer view" className="scroll-mt-24 border-t border-line bg-[var(--r-card)]">
        <div className="container-x section-y">
          <Reveal>
            <p className="type-label text-[var(--r-primary)]">Chapter 3</p>
            <h2 className="type-h2 mt-1">The customer view</h2>
            <p className="type-lead mt-2 max-w-2xl text-ink-muted">
              Buy, receive, save, verify, return — every step links back to the trusted record.
            </p>
          </Reveal>
          <ol className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {CUSTOMER_STEPS.map((s, i) => (
              <li key={s.step}>
                <Reveal delay={(i % 4) * 0.06} className="h-full">
                  <Link
                    href={s.href}
                    className="group flex h-full flex-col rounded-2xl border border-line bg-background p-4 transition-colors hover:border-[var(--r-primary)]"
                  >
                    <span className="type-caption font-bold text-[var(--r-primary)]" aria-hidden="true">
                      Step {s.step}
                    </span>
                    <span className="mt-1 text-[0.9375rem] font-bold">{s.title}</span>
                    <span className="type-small mt-0.5 flex-1 text-ink-muted">{s.text}</span>
                    <span className="type-small mt-2 inline-flex items-center gap-1 font-semibold text-[var(--r-primary)]">
                      Open live
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 5 — Merchant view */}
      <section id="merchant" aria-label="Merchant view" className="scroll-mt-24 border-t border-line">
        <div className="container-x section-y grid gap-8 lg:grid-cols-2">
          <Reveal>
            <p className="type-label text-[var(--r-primary)]">Chapter 4</p>
            <h2 className="type-h2 mt-1">The merchant view</h2>
            <p className="type-lead mt-2 max-w-xl text-ink-muted">
              The merchant keeps their POS. Receipti adds the trusted record, the dashboard, and the
              proof that settles returns and disputes.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/demo/merchant-pos">
                <Button>Try the POS</Button>
              </Link>
              <Link href="/merchant">
                <Button variant="outline">Open dashboard</Button>
              </Link>
            </div>
          </Reveal>
          <ol className="relative flex flex-col border-l-2 border-line" aria-label="Merchant journey">
            {MERCHANT_STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.04}>
                <li className="relative flex gap-4 pb-5 pl-6 last:pb-1">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[13px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--r-primary)] text-[0.6875rem] font-bold text-white"
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.9375rem] font-bold">{s.title}</p>
                    <p className="type-small text-ink-muted">{s.text}</p>
                    <Link
                      href={s.href}
                      className="type-small mt-1 inline-flex items-center gap-1 font-semibold text-[var(--r-primary)]"
                    >
                      Open
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 6 — Ecosystem */}
      <section id="ecosystem" aria-label="Extended ecosystem" className="scroll-mt-24 border-t border-line bg-[var(--r-card)]">
        <div className="container-x section-y">
          <Reveal>
            <p className="type-label text-[var(--r-primary)]">Chapter 5</p>
            <h2 className="type-h2 mt-1">Beyond the receipt</h2>
            <p className="type-lead mt-2 max-w-2xl text-ink-muted">
              The same trusted record grows into refunds, specialized verticals, and future institutional use.
            </p>
          </Reveal>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {ECOSYSTEM.map((e, i) => (
              <Reveal key={e.title} delay={i * 0.08}>
                <Card className="flex h-full flex-col">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--r-primary-muted)] text-[var(--r-primary)]">
                    <e.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="type-h4 mt-3">{e.title}</h3>
                  <p className="type-small mt-1 flex-1 text-ink-muted">{e.text}</p>
                  <Link
                    href={e.href}
                    className="type-small mt-3 inline-flex items-center gap-1 font-semibold text-[var(--r-primary)]"
                  >
                    {e.cta}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 7 — Is / is not */}
      <section id="positioning" aria-label="What Receipti is" className="scroll-mt-24 border-t border-line">
        <div className="container-x section-y">
          <Reveal>
            <p className="type-label text-[var(--r-primary)]">Chapter 6</p>
            <h2 className="type-h2 mt-1">Honest about what this is</h2>
          </Reveal>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Reveal>
              <Card>
                <h3 className="type-h4">What Receipti is</h3>
                <ul className="mt-3 flex flex-col gap-2">
                  {IS_LIST.map((t) => (
                    <li key={t} className="flex items-center gap-2.5 text-sm font-medium">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--r-verified-muted)] text-[var(--r-verified)]">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
            <Reveal delay={0.08}>
              <Card>
                <h3 className="type-h4">What Receipti is not</h3>
                <ul className="mt-3 flex flex-col gap-2">
                  {IS_NOT_LIST.map((t) => (
                    <li key={t} className="flex items-center gap-2.5 text-sm font-medium">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--r-error-muted)] text-[var(--r-error)]">
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 8 — Final CTA */}
      <section aria-label="Try the demo" className="border-t border-line bg-[var(--r-primary)] text-white">
        <div className="container-x section-y text-center">
          <Reveal>
            <h2 className="type-h2 text-balance">This story is clickable.</h2>
            <p className="type-lead mx-auto mt-2 max-w-xl text-white/80">
              Every chapter you just read is a live prototype page. Start from the hub — or jump
              straight into the experience.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
              <Link href="/demo">
                <Button size="lg" className="w-full bg-white text-[var(--r-primary)] hover:bg-white/90 sm:w-auto">
                  Explore the demo hub
                </Button>
              </Link>
              <Link href="/customer/wallet">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white/40 text-white hover:bg-white/10 sm:w-auto"
                  leftIcon={<Wallet className="h-4 w-4" aria-hidden="true" />}
                >
                  View customer experience
                </Button>
              </Link>
              <Link href="/verify">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white/40 text-white hover:bg-white/10 sm:w-auto"
                  leftIcon={<ScanSearch className="h-4 w-4" aria-hidden="true" />}
                >
                  Verify any receipt
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
