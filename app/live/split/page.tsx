import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Breadcrumb, Button } from "@/components/ui";
import { SyncBadge } from "@/components/live/SyncBadge";
import { LiveProvider } from "@/components/live/LiveProvider";
import { MerchantPos } from "@/components/live/MerchantPos";
import { CustomerDisplay } from "@/components/live/CustomerDisplay";

export const metadata: Metadata = {
  title: "Split Screen · Live Demo",
  description:
    "Split-screen investor demo: the merchant till and the customer display running one synchronized transaction side by side.",
};

export default function LiveSplitPage() {
  return (
    <div className="container-x flex max-w-7xl flex-col gap-5 py-8 lg:py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Live Demo", href: "/live" },
          { label: "Split Screen" },
        ]}
      />
      <LiveProvider>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="type-label text-[var(--r-primary)]">Investor demo</p>
          <h1 className="type-h1 mt-1">Split screen</h1>
          <p className="type-small mt-1 max-w-2xl text-ink-muted">
            Scan on the merchant till (left) and the customer display (right) reacts instantly —
            one shared transaction, no refresh.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SyncBadge />
          <Link href="/live/merchant" target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" rightIcon={<ExternalLink className="h-4 w-4" aria-hidden="true" />}>
              Till in new tab
            </Button>
          </Link>
          <Link href="/live/customer" target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" rightIcon={<ExternalLink className="h-4 w-4" aria-hidden="true" />}>
              Display in new tab
            </Button>
          </Link>
        </div>
      </div>
        <div className="grid items-start gap-5 xl:grid-cols-2">
          <section aria-label="Merchant till">
            <MerchantPos />
          </section>
          <section aria-label="Customer display" className="xl:sticky xl:top-24">
            <CustomerDisplay />
          </section>
        </div>
      </LiveProvider>
    </div>
  );
}
