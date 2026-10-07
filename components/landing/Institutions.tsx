import { Landmark } from "lucide-react";
import { Badge, SectionHeader } from "@/components/ui";
import { Reveal } from "./Reveal";

const USERS = ["Tax authorities", "Regulators", "Auditors", "Authorized institutions"] as const;

export function Institutions() {
  return (
    <section aria-labelledby="institutions-heading" className="section-y">
      <div className="container-x">
        <Reveal>
          <div className="rounded-3xl bg-[var(--r-dark)] px-6 py-12 sm:px-12 sm:py-16">
            <div className="mx-auto max-w-2xl text-center">
              <Badge tone="dark" dot>
                <span className="inline-flex items-center gap-1.5">
                  <Landmark className="h-3.5 w-3.5" aria-hidden="true" /> Future capability
                </span>
              </Badge>
              <div className="mt-4">
                <SectionHeader
                  id="institutions-heading"
                  tone="dark"
                  align="center"
                  title="Trusted records can support authorized institutional workflows."
                  description="Over time, verifiable transaction records could streamline audits, compliance checks, and tax reporting — for parties explicitly granted access."
                />
              </div>
              <ul className="mt-8 flex flex-wrap justify-center gap-2">
                {USERS.map((u) => (
                  <li
                    key={u}
                    className="rounded-full border border-[var(--r-dark-line)] bg-[var(--r-dark-raised)] px-4 py-2 text-sm font-medium text-[var(--r-on-dark)]"
                  >
                    {u}
                  </li>
                ))}
              </ul>
              <p className="type-small mx-auto mt-8 max-w-xl text-[var(--r-on-dark-muted)]">
                Any such access would be scoped, authorized, logged, and governed by
                applicable privacy and legal requirements. Receipti does not provide
                unrestricted access to any third party.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
