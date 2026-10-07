import { ArrowDown, ArrowRight, Link2 } from "lucide-react";
import {
  Card,
  SectionHeader,
  TransactionStatusBadge,
  VerificationStatusBadge,
} from "@/components/ui";
import { Reveal } from "./Reveal";

function Connector() {
  return (
    <div aria-hidden="true" className="flex items-center justify-center py-1 lg:py-0 lg:px-1">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--r-dark)] text-[var(--r-on-dark)]">
        <ArrowDown className="h-4 w-4 lg:hidden" />
        <ArrowRight className="hidden h-4 w-4 lg:block" />
      </span>
    </div>
  );
}

export function Returns() {
  return (
    <section aria-labelledby="returns-heading" className="section-y bg-[var(--r-card)]">
      <div className="container-x">
        <Reveal>
          <SectionHeader
            id="returns-heading"
            align="center"
            eyebrow="Returns & refunds"
            title="Lost receipt? Not with Receipti."
            description="Refunds link to the original receipt as new events — the sale, the refund, and the history stay intact. Nothing is deleted or overwritten."
          />
        </Reveal>

        <div className="mx-auto mt-10 flex max-w-4xl flex-col items-stretch lg:flex-row lg:items-stretch lg:justify-center">
          <Reveal className="flex-1">
            <Card className="h-full">
              <p className="type-label text-ink-faint">Original receipt</p>
              <p className="type-amount mt-2 text-2xl tnum">AED 3,000</p>
              <p className="type-caption mt-1 text-ink-muted" data-mono>
                RCPT-DEMO-001
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <TransactionStatusBadge status="PAID" />
                <VerificationStatusBadge status="VERIFIED" />
              </div>
            </Card>
          </Reveal>
          <Connector />
          <Reveal delay={0.08} className="flex-1">
            <Card className="h-full border-[var(--r-primary)]">
              <p className="type-label flex items-center gap-1.5 text-[var(--r-primary)]">
                <Link2 className="h-3.5 w-3.5" aria-hidden="true" /> Refund transaction
              </p>
              <p className="type-amount mt-2 text-2xl tnum">−AED 3,000</p>
              <p className="type-caption mt-1 text-ink-muted">
                Linked event · 22 Sep 2026
              </p>
              <p className="type-small mt-3 text-ink-muted">
                A new record attached to the original — the sale itself is untouched.
              </p>
            </Card>
          </Reveal>
          <Connector />
          <Reveal delay={0.16} className="flex-1">
            <Card className="h-full">
              <p className="type-label text-ink-faint">Receipt history</p>
              <ul className="type-small mt-2 space-y-1.5">
                <li className="flex justify-between gap-2">
                  <span className="text-ink-muted">Sale</span>
                  <span className="tnum">AED 3,000</span>
                </li>
                <li className="flex justify-between gap-2">
                  <span className="text-ink-muted">Refund</span>
                  <span className="tnum">−AED 3,000</span>
                </li>
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                <TransactionStatusBadge status="REFUNDED" />
                <VerificationStatusBadge status="VERIFIED" />
              </div>
            </Card>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <p className="type-small mx-auto mt-8 max-w-xl text-center text-ink-muted">
            Partial refund? The receipt reflects exactly what was returned — item by item —
            while staying verifiable throughout.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
