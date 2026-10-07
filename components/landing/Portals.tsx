import Link from "next/link";
import { ArrowRight, LayoutDashboard, Rocket, Store, User, type LucideIcon } from "lucide-react";
import { Button, Card, SectionHeader } from "@/components/ui";
import { Reveal } from "./Reveal";

interface PortalCard {
  icon: LucideIcon;
  title: string;
  text: string;
  href: string;
  cta: string;
}

const CARDS: PortalCard[] = [
  {
    icon: User,
    title: "Customer Portal",
    text: "Store, view, search and manage your digital receipts.",
    href: "/customer",
    cta: "Open Customer Portal",
  },
  {
    icon: Store,
    title: "Merchant Portal",
    text: "Manage receipts, transactions, refunds and integrations.",
    href: "/merchant",
    cta: "Open Merchant Portal",
  },
  {
    icon: LayoutDashboard,
    title: "Admin",
    text: "Monitor the Receipti system, merchants, receipts and platform activity.",
    href: "/admin",
    cta: "Open Admin",
  },
  {
    icon: Rocket,
    title: "Interactive Demo",
    text: "Walk the full story — POS to wallet to verification — step by step.",
    href: "/demo",
    cta: "Launch Demo",
  },
];

/** Portal entry section — every card links to a real, working destination. */
export function Portals() {
  return (
    <section aria-labelledby="portals-heading" id="experience" className="section-y scroll-mt-16">
      <div className="container-x">
        <Reveal>
          <SectionHeader
            align="center"
            eyebrow="Live prototype"
            title="Experience Receipti"
            description="Three portals, one trusted record. Jump into the side that matters to you — everything is clickable."
            id="portals-heading"
          />
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {CARDS.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.06} className="h-full">
              <Card as="article" hover className="flex h-full flex-col">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--r-primary-muted)] text-[var(--r-primary)]">
                  <c.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="type-h4 mt-4">{c.title}</h3>
                <p className="type-small mt-1.5 flex-1 text-ink-muted">{c.text}</p>
                <div className="mt-5">
                  <Link href={c.href}>
                    <Button className="w-full" rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
                      {c.cta}
                    </Button>
                  </Link>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
