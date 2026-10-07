import { Cpu, Printer, ReceiptText, Store } from "lucide-react";
import { SectionHeader } from "@/components/ui";
import { Reveal } from "./Reveal";

function MiniFlow({
  steps,
  future = false,
}: {
  steps: { icon: React.ReactNode; label: string }[];
  future?: boolean;
}) {
  return (
    <ol className="mt-6 space-y-0">
      {steps.map((s, i) => (
        <li key={s.label}>
          <div
            className={
              future && i === 1
                ? "flex items-center gap-3 rounded-xl bg-[var(--r-primary)] px-4 py-3 text-white"
                : "flex items-center gap-3 rounded-xl border border-line bg-[var(--r-card)] px-4 py-3"
            }
          >
            <span
              className={
                future && i === 1
                  ? "flex h-9 w-9 items-center justify-center rounded-lg bg-white/15"
                  : "flex h-9 w-9 items-center justify-center rounded-lg bg-background"
              }
            >
              {s.icon}
            </span>
            <span className="text-sm font-semibold">{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div aria-hidden="true" className="flex justify-center py-1.5">
              <span className={future ? "h-5 w-px bg-[var(--r-primary)]" : "h-5 w-px bg-line"} />
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

export function Transition() {
  return (
    <section aria-labelledby="transition-heading" className="section-y bg-[var(--r-card)]">
      <div className="container-x">
        <Reveal>
          <SectionHeader
            id="transition-heading"
            align="center"
            eyebrow="The transition"
            title="From disposable slips to persistent records."
            description="The checkout stays the same. What changes is where the receipt lives — and how long it lasts."
          />
        </Reveal>
        <div className="mx-auto mt-10 grid max-w-4xl gap-3 md:grid-cols-2">
          <Reveal>
            <article className="h-full rounded-2xl border border-line bg-background/60 p-6">
              <p className="type-label text-ink-faint">Today</p>
              <MiniFlow
                steps={[
                  { icon: <Store className="h-4 w-4" aria-hidden="true" />, label: "POS" },
                  { icon: <Printer className="h-4 w-4" aria-hidden="true" />, label: "Paper receipt" },
                ]}
              />
              <p className="type-small mt-5 text-ink-muted">
                Printed, handed over, and usually lost, faded, or binned within days.
              </p>
            </article>
          </Reveal>
          <Reveal delay={0.08}>
            <article className="h-full rounded-2xl border border-[var(--r-primary)] bg-[var(--r-primary-muted)]/40 p-6">
              <p className="type-label text-[var(--r-primary)]">Future · with Receipti</p>
              <MiniFlow
                future
                steps={[
                  { icon: <Store className="h-4 w-4" aria-hidden="true" />, label: "POS" },
                  { icon: <Cpu className="h-4 w-4" aria-hidden="true" />, label: "Receipti" },
                  { icon: <ReceiptText className="h-4 w-4" aria-hidden="true" />, label: "Digital receipt" },
                ]}
              />
              <p className="type-small mt-5 text-ink-muted">
                Persistent, searchable, and verifiable — in the customer&apos;s wallet
                the moment the sale completes.
              </p>
            </article>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <p className="type-small mx-auto mt-8 max-w-xl text-center text-ink-muted">
            Paper doesn&apos;t have to vanish overnight — it can remain as an optional
            fallback wherever it&apos;s still needed.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
