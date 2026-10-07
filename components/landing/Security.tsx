import {
  FileLock2,
  KeyRound,
  Lock,
  ScrollText,
  ShieldCheck,
  Split,
  Stamp,
  Unplug,
} from "lucide-react";
import { Card, SectionHeader } from "@/components/ui";
import { Reveal } from "./Reveal";

const ITEMS = [
  { icon: KeyRound, title: "Secure API access", text: "Authenticated, revocable credentials for every integration." },
  { icon: Split, title: "Scoped permissions", text: "Each key and webhook sees only what it needs." },
  { icon: Stamp, title: "Webhook signatures", text: "Verify every event genuinely came from Receipti." },
  { icon: FileLock2, title: "Integrity metadata", text: "Tamper-evident fingerprints on every record." },
  { icon: ScrollText, title: "Audit logging", text: "A trail of who changed what, and when." },
  { icon: Lock, title: "Encrypted transport", text: "Data protected in transit, end to end." },
  { icon: ShieldCheck, title: "Secure references", text: "Opaque, unguessable receipt references." },
  { icon: Unplug, title: "Tenant isolation", text: "Merchant data kept strictly separated." },
] as const;

export function Security() {
  return (
    <section aria-labelledby="security-heading" id="security" className="section-y scroll-mt-16 bg-[var(--r-card)]">
      <div className="container-x">
        <Reveal>
          <SectionHeader
            id="security-heading"
            eyebrow="Security"
            title="Serious about the record, restrained about the claims."
            description="Security properties built into the architecture from day one — described plainly, without borrowed badges."
          />
        </Reveal>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item, i) => (
            <Reveal key={item.title} delay={Math.min(i * 0.05, 0.3)}>
              <Card as="article" className="h-full">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--r-dark)] text-[var(--r-on-dark)]">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-[0.9375rem] font-semibold">{item.title}</h3>
                <p className="type-small mt-1 text-ink-muted">{item.text}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
