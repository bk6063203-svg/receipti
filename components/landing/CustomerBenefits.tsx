import { Check, Home, ReceiptText, Search, User } from "lucide-react";
import { SectionHeader } from "@/components/ui";
import { Reveal } from "./Reveal";

const BENEFITS = [
  "Digital receipt wallet",
  "Searchable receipt history",
  "Detailed, item-level purchases",
  "Product information where provided",
  "Refund history on every receipt",
  "Return support without the paper hunt",
  "Verification when a receipt is questioned",
  "Zero dependence on fading paper",
] as const;

function PhoneMock() {
  return (
    <div
      role="img"
      aria-label="Preview of the Receipti wallet app showing saved receipts"
      className="relative mx-auto w-full max-w-[19rem]"
    >
      <div className="overflow-hidden rounded-[2rem] border border-line bg-[var(--r-card)] shadow-card" aria-hidden="true">
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-4 text-[0.6875rem] font-semibold text-ink">
          <span>9:41</span>
          <span className="h-5 w-24 rounded-full bg-[var(--r-dark)]" />
          <span className="tnum">5G</span>
        </div>
        <div className="space-y-3 px-4 pb-4 pt-4">
          <div>
            <p className="type-caption text-ink-faint">Good evening</p>
            <p className="text-lg font-bold">Ayesha&apos;s wallet</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-background px-3 py-2.5">
            <Search className="h-4 w-4 text-ink-faint" />
            <span className="text-[0.8125rem] text-ink-faint">Search receipts…</span>
          </div>
          {[
            { m: "Urban Threads", id: "RCPT-DEMO-001", total: "AED 3,000", pill: "Paid", pillClass: "bg-[var(--r-primary-muted)] text-[var(--r-primary)]" },
            { m: "City Fresh Mart", id: "RCP-2026-004213", total: "Rs 8,253", pill: "Refunded", pillClass: "bg-[var(--r-info-muted)] text-[var(--r-info)]" },
          ].map((r) => (
            <div key={r.id} className="rounded-xl border border-line p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[0.8125rem] font-semibold">{r.m}</p>
                <p className="type-amount shrink-0 text-[0.8125rem] tnum">{r.total}</p>
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <p className="type-caption text-ink-faint" data-mono>
                  {r.id}
                </p>
                <span className={`rounded-full px-2 py-0.5 type-status ${r.pillClass}`}>{r.pill}</span>
              </div>
            </div>
          ))}
          {/* Tab bar */}
          <div className="flex items-center justify-around rounded-xl bg-[var(--r-dark)] px-2 py-2.5 text-[var(--r-on-dark-muted)]">
            <Home className="h-5 w-5" />
            <ReceiptText className="h-5 w-5 text-[var(--r-accent)]" />
            <Search className="h-5 w-5" />
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CustomerBenefits() {
  return (
    <section aria-labelledby="customers-heading" id="customers" className="section-y scroll-mt-16 bg-[var(--r-card)]">
      <div className="container-x grid items-center gap-12 lg:grid-cols-2">
        <div>
          <Reveal>
            <SectionHeader
              id="customers-heading"
              eyebrow="For customers"
              title="Your receipts. Always with you."
              description="Every purchase lands in one searchable wallet — with the detail, history, and proof you need when it matters."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="mt-8 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm font-medium">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--r-primary-muted)] text-[var(--r-primary)]">
                    <Check className="h-3 w-3" aria-hidden="true" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="type-caption mt-6 text-ink-faint">
              Preview of the future Receipti wallet experience.
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.12}>
          <PhoneMock />
        </Reveal>
      </div>
    </section>
  );
}
