import { ArrowDown, ArrowRight, Boxes, Cpu, FileJson2 } from "lucide-react";
import { Card, SectionHeader } from "@/components/ui";
import { Reveal } from "./Reveal";

const SOURCES = ["POS", "ERP", "E-commerce", "Custom software"] as const;
const OUTPUTS = [
  "Digital receipts",
  "Receipt records",
  "Status updates",
  "Verification",
  "Audit events",
] as const;

function Connector() {
  return (
    <div aria-hidden="true" className="flex items-center justify-center">
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-[var(--r-card)] text-ink-faint">
        <ArrowDown className="h-4 w-4 lg:hidden" />
        <ArrowRight className="hidden h-4 w-4 lg:block" />
      </span>
    </div>
  );
}

export function ApiInfra() {
  return (
    <section aria-labelledby="api-heading" className="section-y">
      <div className="container-x">
        <Reveal>
          <SectionHeader
            id="api-heading"
            align="center"
            eyebrow="Infrastructure"
            title="Built to connect with the systems businesses already use."
            description="One integration point between your transaction software and every customer receipt. Simple to adopt, designed to scale."
          />
        </Reveal>
        <div className="mx-auto mt-10 flex max-w-5xl flex-col items-stretch gap-2 lg:flex-row lg:items-stretch">
          <Reveal className="flex-1">
            <Card className="h-full">
              <p className="type-label flex items-center gap-1.5 text-ink-muted">
                <Boxes className="h-3.5 w-3.5" aria-hidden="true" /> Connect
              </p>
              <ul className="mt-3 space-y-2">
                {SOURCES.map((s) => (
                  <li key={s} className="rounded-lg bg-background px-3 py-2 text-sm font-medium">
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
          <div className="flex items-center justify-center lg:flex-col">
            <Connector />
          </div>
          <Reveal delay={0.08} className="flex-1">
            <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-[var(--r-dark)] p-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--r-accent)]/15 text-[var(--r-accent)]">
                <Cpu className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="type-h3 mt-3 text-[var(--r-on-dark)]">Receipti API</p>
              <p className="type-small mt-1 text-[var(--r-on-dark-muted)]">
                One integration. Every receipt.
              </p>
            </div>
          </Reveal>
          <div className="flex items-center justify-center lg:flex-col">
            <Connector />
          </div>
          <Reveal delay={0.16} className="flex-1">
            <Card className="h-full">
              <p className="type-label flex items-center gap-1.5 text-ink-muted">
                <FileJson2 className="h-3.5 w-3.5" aria-hidden="true" /> Produce
              </p>
              <ul className="mt-3 space-y-2">
                {OUTPUTS.map((o) => (
                  <li key={o} className="rounded-lg bg-[var(--r-primary-muted)]/60 px-3 py-2 text-sm font-medium text-ink">
                    {o}
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <p className="type-caption mt-6 text-center text-ink-faint">
            Full API documentation ships with the merchant developer release.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
