import { BadgeCheck, Hash, ListChecks, QrCode, Sigma } from "lucide-react";
import { SectionHeader, TransactionStatusBadge, VerificationStatusBadge } from "@/components/ui";
import { QRPanel } from "@/components/verification";
import { Reveal } from "./Reveal";

const ANATOMY = [
  { icon: Hash, title: "Stable receipt ID", text: "RCPT-DEMO-001 — the permanent reference for this sale." },
  { icon: ListChecks, title: "Item-level detail", text: "Quantities, unit prices, and merchant-provided info." },
  { icon: Sigma, title: "Transparent totals", text: "Subtotal, tax treatment, and grand total — always itemized." },
  { icon: BadgeCheck, title: "Dual status", text: "Payment state and verification state, tracked independently." },
  { icon: QrCode, title: "QR reference", text: "The primary channel to open and check the trusted record." },
] as const;

export function ReceiptPreview() {
  return (
    <section aria-labelledby="demo-heading" id="demo" className="section-y scroll-mt-16 bg-[var(--r-card)]">
      <div className="container-x grid items-start gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        {/* The receipt */}
        <Reveal className="mx-auto w-full max-w-md lg:sticky lg:top-24">
          <article
            aria-label="Example digital receipt from Urban Threads"
            className="overflow-hidden rounded-2xl border border-line bg-[var(--r-card)] shadow-card"
          >
            <div className="border-b border-line px-6 py-5 text-center">
              <p className="text-lg font-bold tracking-tight">Urban Threads</p>
              <p className="type-small mt-0.5 text-ink-muted">Downtown Branch · Dubai</p>
              <p className="type-caption mt-1 text-ink-faint tnum">20 Sep 2026 · 6:24 PM</p>
            </div>
            <div className="space-y-3 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Jacket</p>
                  <p className="type-caption mt-0.5 text-ink-muted tnum">2 × AED 1,500.00</p>
                </div>
                <p className="type-small font-semibold tnum">AED 3,000.00</p>
              </div>
              <dl className="space-y-1.5 border-t border-dashed border-line pt-3">
                <div className="flex justify-between">
                  <dt className="type-small text-ink-muted">Subtotal</dt>
                  <dd className="type-small tnum">AED 3,000.00</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="type-small text-ink-muted">Tax (5% incl.)</dt>
                  <dd className="type-small tnum">AED 142.86</dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-line pt-2">
                  <dt className="type-small font-semibold">Total</dt>
                  <dd className="type-amount text-xl tnum">AED 3,000.00</dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-2 pt-1">
                <TransactionStatusBadge status="PAID" />
                <VerificationStatusBadge status="VERIFIED" />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-xl bg-background px-4 py-3">
                <div>
                  <p className="type-label text-ink-faint">Receipt ID</p>
                  <p className="type-small mt-0.5 font-semibold" data-mono>
                    RCPT-DEMO-001
                  </p>
                  <p className="type-caption mt-0.5 text-ink-muted">Card ···· 4412</p>
                </div>
                <QRPanel payload="https://receipti.pk/v/RCPT-DEMO-001" size="sm" caption="Verify" />
              </div>
            </div>
            <div className="receipt-edge" aria-hidden="true" />
            <p className="type-caption bg-background/60 px-6 py-3 text-center text-ink-faint">
              Tamper-evident record · Altered copies are detectable when checked
            </p>
          </article>
        </Reveal>

        {/* Anatomy */}
        <div>
          <Reveal>
            <SectionHeader
              id="demo-heading"
              eyebrow="Receipt preview"
              title="A genuine digital receipt — not a screenshot of one."
              description="Every Receipti record carries the full detail of the sale, dual payment and verification status, and a QR reference back to the authoritative copy."
            />
          </Reveal>
          <ul className="mt-8 space-y-5">
            {ANATOMY.map((a, i) => (
              <Reveal key={a.title} delay={i * 0.06}>
                <li className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--r-primary-muted)] text-[var(--r-primary)]">
                    <a.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-[0.9375rem] font-semibold">{a.title}</span>
                    <span className="type-small mt-0.5 block text-ink-muted">{a.text}</span>
                  </span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
