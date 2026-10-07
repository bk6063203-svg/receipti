import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { Reveal } from "./Reveal";

export function FinalCta() {
  return (
    <section aria-labelledby="cta-heading" id="get-started" className="section-y scroll-mt-16 bg-[var(--r-dark)]">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <h2 id="cta-heading" className="type-h1 text-balance text-[var(--r-on-dark)]">
              Receipts shouldn&apos;t be disposable.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="type-body mt-4 text-[var(--r-on-dark-muted)]">
              They should be digital, persistent, and ready when needed — for returns,
              records, disputes, and verification.
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="mt-8 flex flex-col justify-center gap-2.5 sm:flex-row">
              <Link href="/demo">
                <Button size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
                  Get Started
                </Button>
              </Link>
              <Link href="/#demo">
                <Button size="lg" variant="outline" className="w-full border-[var(--r-dark-line)] bg-transparent text-[var(--r-on-dark)] hover:bg-[var(--r-dark-raised)] sm:w-auto">
                  See Demo
                </Button>
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.22}>
            <p className="type-caption mt-5 text-[var(--r-on-dark-muted)]">
              Merchant POS / ERP → Receipti → Digital Receipt → Wallet → Refunds & Verification
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
