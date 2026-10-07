import { Check, Database, Plug2, ReceiptText, Store } from "lucide-react";
import { SectionHeader } from "@/components/ui";
import { Flow } from "./Flow";
import { Reveal } from "./Reveal";

const BENEFITS = [
  "Digital receipts from every sale",
  "Reduced dependence on paper",
  "Customer receipt history, handled",
  "Return and refund support",
  "Clean transaction records",
  "Verification capability built in",
  "Works with existing systems",
  "Future-ready infrastructure",
] as const;

export function Merchants() {
  return (
    <section aria-labelledby="business-heading" id="business" className="section-y scroll-mt-16 bg-[var(--r-dark)]">
      <div className="container-x">
        <Reveal>
          <SectionHeader
            id="business-heading"
            tone="dark"
            eyebrow="For businesses"
            title="Keep your systems. Upgrade the receipt."
            description="Receipti connects with your existing POS, ERP, or transaction software through APIs, webhooks, and integrations — your checkout doesn't change, your receipts do."
          />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-10 rounded-2xl border border-[var(--r-dark-line)] bg-[var(--r-dark-raised)] p-5 sm:p-8">
            <Flow
              nodes={[
                { icon: <Store className="h-5 w-5" aria-hidden="true" />, title: "Merchant POS", text: "Source system" },
                { icon: <Plug2 className="h-5 w-5" aria-hidden="true" />, title: "Receipti API", text: "APIs & webhooks", highlight: true },
                { icon: <Database className="h-5 w-5" aria-hidden="true" />, title: "Receipt infrastructure", text: "Trusted records" },
                { icon: <ReceiptText className="h-5 w-5" aria-hidden="true" />, title: "Customer", text: "Wallet & returns" },
              ]}
            />
          </div>
        </Reveal>
        <Reveal delay={0.16}>
          <ul className="mt-10 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm font-medium text-[var(--r-on-dark)]">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--r-accent)]/15 text-[var(--r-accent)]">
                  <Check className="h-3 w-3" aria-hidden="true" />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
