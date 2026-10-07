import { CircleX, Fingerprint, ScanSearch, ShieldCheck } from "lucide-react";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { Reveal } from "./Reveal";

const CONCEPTS = ["Tamper-evident", "Cryptographically verifiable", "Independently checkable"] as const;

export function Verification() {
  return (
    <section aria-labelledby="verify-heading" className="section-y">
      <div className="container-x">
        <Reveal>
          <SectionHeader
            id="verify-heading"
            eyebrow="Trust & verification"
            title="When a receipt needs to be checked, there's an answer."
            description="Verification is a supporting feature, not the whole story. When it matters — a return, a dispute, an audit — Receipti provides a trusted reference against the authoritative record."
          />
        </Reveal>
        <div className="mt-10 grid gap-3 md:grid-cols-2">
          <Reveal>
            <Card as="article" className="h-full">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--r-verified-muted)] text-[var(--r-verified)]">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="type-h3 mt-4">Authentic receipt</h3>
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--r-verified-muted)] px-3 py-1.5 type-status text-[var(--r-verified)]">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Verified
              </p>
              <p className="type-small mt-3 text-ink-muted">
                The presented receipt matches the authoritative Receipti record — items,
                totals, and all.
              </p>
            </Card>
          </Reveal>
          <Reveal delay={0.08}>
            <Card as="article" className="h-full">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--r-danger-muted)] text-[var(--r-danger)]">
                <CircleX className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="type-h3 mt-4">Modified copy</h3>
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--r-danger-muted)] px-3 py-1.5 type-status text-[var(--r-danger)]">
                <CircleX className="h-4 w-4" aria-hidden="true" /> Record mismatch
              </p>
              <p className="type-small mt-3 text-ink-muted">
                An altered total, item, or date no longer matches — the difference is
                detected when checked.
              </p>
            </Card>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <ScanSearch className="h-4 w-4 text-ink-faint" aria-hidden="true" />
            {CONCEPTS.map((c) => (
              <Badge key={c} tone="neutral">
                {c}
              </Badge>
            ))}
          </div>
          <p className="type-small mt-4 flex max-w-2xl gap-2 text-ink-muted">
            <Fingerprint className="h-4 w-4 mt-0.5 shrink-0 text-ink-faint" aria-hidden="true" />
            An honest note: screenshots and printouts can always exist. The point is that
            an altered copy can be detected when checked against the authoritative record.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
