import { Cpu, ReceiptText, Store, Wallet } from "lucide-react";
import { SectionHeader } from "@/components/ui";
import { Flow } from "./Flow";
import { Reveal } from "./Reveal";

export function Solution() {
  return (
    <section aria-labelledby="solution-heading" id="product" className="section-y scroll-mt-16 bg-[var(--r-card)]">
      <div className="container-x" id="solution-heading">
        <Reveal>
          <SectionHeader
            align="center"
            eyebrow="The solution"
            title="The infrastructure layer between the sale and the customer."
            description="Receipti connects to existing merchant transaction systems and creates a persistent digital receipt record — no rip-and-replace required."
          />
        </Reveal>
        <Reveal delay={0.1}>
          <Flow
            className="mt-10"
            nodes={[
              { icon: <Store className="h-5 w-5" aria-hidden="true" />, title: "Merchant POS / ERP", text: "Your systems stay" },
              { icon: <Cpu className="h-5 w-5" aria-hidden="true" />, title: "Receipti", text: "Trusted record created", highlight: true },
              { icon: <ReceiptText className="h-5 w-5" aria-hidden="true" />, title: "Digital receipt", text: "Persistent & verifiable" },
              { icon: <Wallet className="h-5 w-5" aria-hidden="true" />, title: "Customer", text: "Wallet & verification" },
            ]}
          />
        </Reveal>
        <Reveal delay={0.18}>
          <p className="type-small mx-auto mt-8 max-w-xl text-center text-ink-muted">
            Your POS stays the source of truth for the transaction. Receipti becomes the
            trusted home of the receipt — accessible long after paper would have faded.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
