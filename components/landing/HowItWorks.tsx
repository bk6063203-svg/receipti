import { Badge, Card, SectionHeader } from "@/components/ui";
import { Reveal } from "./Reveal";

const STEPS = [
  {
    n: "01",
    title: "Customer purchases",
    text: "Payment happens as usual — online or in store, through the merchant's existing checkout.",
  },
  {
    n: "02",
    title: "Merchant records the transaction",
    text: "The existing POS, ERP, or database records the sale. Nothing about checkout changes.",
  },
  {
    n: "03",
    title: "Receipti creates the digital receipt",
    text: "Receipti receives the permitted transaction data and creates a trusted, tamper-evident receipt record.",
  },
  {
    n: "04",
    title: "Customer receives the receipt",
    text: "The receipt lands in the customer's hands instantly — ready for records, returns, and verification.",
  },
] as const;

const ACCESS = ["QR code", "Merchant handoff", "Receipti account"] as const;

export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" id="how-it-works" className="section-y scroll-mt-16">
      <div className="container-x">
        <Reveal>
          <SectionHeader
            id="how-heading"
            eyebrow="How it works"
            title="From sale to trusted receipt in four steps."
            description="A simple flow that fits around the systems merchants already run and the habits customers already have."
          />
        </Reveal>
        <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.n}>
              <Reveal delay={i * 0.08} className="h-full">
                <Card as="article" hover className="flex h-full flex-col">
                  <p className="type-amount text-3xl text-[var(--r-primary)]" aria-hidden="true">
                    {s.n}
                  </p>
                  <h3 className="mt-3 text-[0.9375rem] font-semibold">
                    {s.title}
                  </h3>
                  <p className="type-small mt-1.5 text-ink-muted">{s.text}</p>
                </Card>
              </Reveal>
            </li>
          ))}
        </ol>
        <Reveal delay={0.1}>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="type-small font-medium">Customer access:</span>
            {ACCESS.map((a) => (
              <Badge key={a} tone="neutral">
                {a}
              </Badge>
            ))}
            <Badge tone="neutral">NFC · future</Badge>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
