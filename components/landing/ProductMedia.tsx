import Image from "next/image";
import { ImagePlus } from "lucide-react";
import { Card, SectionHeader } from "@/components/ui";
import { Reveal } from "./Reveal";

export function ProductMedia() {
  return (
    <section aria-labelledby="media-heading" className="section-y">
      <div className="container-x grid items-center gap-12 lg:grid-cols-2">
        <div>
          <Reveal>
            <SectionHeader
              id="media-heading"
              eyebrow="Product media"
              title="Receipts that show what you actually bought."
              description="Where a merchant's system supports it, Receipti line items can carry the merchant's own product information and imagery — so “2 × Jacket” is never a mystery six months later."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <Card className="mt-8 flex items-center gap-4">
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-line">
                <Image
                  src="/images/jacket.jpg"
                  alt="Merchant-provided photo of the jacket on this receipt"
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">2 × Jacket</span>
                <span className="type-caption mt-0.5 block text-ink-muted">
                  Image supplied by the merchant&apos;s catalog
                </span>
              </span>
              <span className="type-amount shrink-0 text-[0.9375rem] tnum">AED 1,500</span>
            </Card>
          </Reveal>
        </div>
        <Reveal delay={0.12}>
          <figure className="relative mx-auto w-full max-w-sm">
            <div className="overflow-hidden rounded-2xl border border-line bg-[var(--r-card)] shadow-card">
              <div className="relative aspect-square">
                <Image
                  src="/images/jacket.jpg"
                  alt="Example merchant product photo: a camel-colored jacket on a studio background"
                  fill
                  sizes="(max-width: 640px) 100vw, 384px"
                  className="object-cover"
                  priority={false}
                />
              </div>
              <figcaption className="flex items-center gap-2.5 px-5 py-4">
                <ImagePlus className="h-4 w-4 shrink-0 text-[var(--r-primary)]" aria-hidden="true" />
                <span className="type-small text-ink-muted">
                  Product media comes from the merchant — Receipti displays what the
                  merchant&apos;s system provides.
                </span>
              </figcaption>
            </div>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
