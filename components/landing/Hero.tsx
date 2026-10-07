import Link from "next/link";
import { ArrowRight, FileCheck2, History, ScanSearch } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { HeroVisual } from "./HeroVisual";
import { Reveal } from "./Reveal";

const ASSURANCES = [
  { icon: FileCheck2, label: "Tamper-evident records" },
  { icon: ScanSearch, label: "Independently verifiable" },
  { icon: History, label: "Persistent history" },
] as const;

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden">
      <div className="container-x grid items-center gap-12 pb-16 pt-12 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-24 lg:pt-20">
        <div>
          <Reveal>
            <Badge tone="primary" dot>
              Digital receipt infrastructure
            </Badge>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 id="hero-heading" className="type-display mt-5 text-balance">
              Digital receipts.
              <br />
              Built for trust.
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="type-body mt-5 max-w-xl text-ink-muted">
              Receipti connects merchant transaction systems with customers, replacing
              physical receipts with persistent digital records that can be securely
              accessed, used for returns, and verified when needed.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Link href="/demo">
                <Button size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
                  Explore Receipti
                </Button>
              </Link>
              <Link href="/customer">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Open Customer Portal
                </Button>
              </Link>
            </div>
            <p className="type-small mt-3 text-ink-muted">
              Run a shop?{" "}
              <Link href="/merchant" className="font-semibold text-[var(--r-primary)]">
                Open Merchant Portal
                <ArrowRight className="ml-1 inline h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <p className="type-caption mt-4 text-ink-faint">
              Works alongside your payment provider — Receipti never processes payments.
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
              {ASSURANCES.map((a) => (
                <li key={a.label} className="flex items-center gap-2 text-sm font-medium text-ink">
                  <a.icon className="h-4 w-4 text-[var(--r-primary)]" aria-hidden="true" />
                  {a.label}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <Reveal delay={0.15} className="lg:pl-4">
          <HeroVisual />
        </Reveal>
      </div>
    </section>
  );
}
