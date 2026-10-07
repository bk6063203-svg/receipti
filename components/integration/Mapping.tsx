"use client";

import { ArrowRight } from "lucide-react";
import { POS_PRODUCTS } from "@/data/pos-catalog";
import { formatMoney } from "@/lib/format";
import { Card } from "@/components/ui";
import { ProductImage } from "@/components/receipt";

const FIELD_MAP: { from: string; to: string; note: string }[] = [
  { from: "transaction_id", to: "merchantTransactionId", note: "Merchant's own id" },
  { from: "created_at", to: "transactionDate", note: "Checkout time" },
  { from: "items[]", to: "receiptItems[]", note: "Lines with SKU + price" },
  { from: "subtotal", to: "subtotal", note: "Before discounts" },
  { from: "discount", to: "discount", note: "Promotions applied" },
  { from: "tax", to: "tax", note: "VAT portion" },
  { from: "total", to: "total", note: "Amount charged" },
  { from: "payment_status", to: "paymentStatus", note: "Paid at POS" },
];

/** Merchant fields → Receipti fields. */
export function MappingTable() {
  return (
    <Card as="section" aria-label="Receipt data mapping" className="h-full">
      <h2 className="text-[0.9375rem] font-semibold">Receipt data mapping</h2>
      <p className="type-small mt-1 text-ink-muted">
        The merchant decides which fields to send — Receipti maps them onto the receipt
        record. Nothing else is requested.
      </p>
      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2" aria-label="Field mappings">
        {FIELD_MAP.map((m) => (
          <li
            key={m.from}
            className="flex items-center gap-2 rounded-xl bg-background px-3 py-2.5"
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate font-mono text-[0.8125rem] font-semibold" title={m.from}>
                {m.from}
              </span>
              <span className="type-caption block text-ink-faint">{m.note}</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-[var(--r-primary)]" aria-hidden="true" />
            <span className="min-w-0 flex-1 text-right">
              <span className="block truncate font-mono text-[0.8125rem] font-semibold text-[var(--r-primary)]" title={m.to}>
                {m.to}
              </span>
              <span className="type-caption block text-ink-faint">Receipti field</span>
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** How merchant product data becomes a receipt line. */
export function MediaMapping() {
  const product = POS_PRODUCTS[0]!;
  return (
    <Card as="section" aria-label="Product media integration" className="h-full">
      <h2 className="text-[0.9375rem] font-semibold">Product media integration</h2>
      <p className="type-small mt-1 text-ink-muted">
        Product details travel with each line — that is why the customer receipt can
        show imagery. Receipti stores no merchant database.
      </p>
      <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        <div className="flex-1 rounded-xl border border-line p-3.5">
          <p className="type-caption font-semibold text-ink-faint">Merchant product database</p>
          <dl className="type-small mt-2 space-y-1">
            <div className="flex justify-between gap-2">
              <dt className="text-ink-muted">Name</dt>
              <dd className="font-semibold">{product.name}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-ink-muted">SKU</dt>
              <dd className="font-semibold" data-mono>{product.sku}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-ink-muted">Category</dt>
              <dd className="font-semibold">{product.category}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-ink-muted">Image</dt>
              <dd className="font-semibold text-[var(--r-primary)]">Attached</dd>
            </div>
          </dl>
        </div>
        <span className="flex justify-center" aria-hidden="true">
          <ArrowRight className="h-5 w-5 rotate-90 text-[var(--r-primary)] sm:rotate-0" />
        </span>
        <div className="flex-1 rounded-xl border border-line bg-background/50 p-3.5">
          <p className="type-caption font-semibold text-ink-faint">Receipti receipt item</p>
          <div className="mt-2 flex items-center gap-3">
            <ProductImage
              media={[{ id: `${product.id}-img`, url: product.image, type: "image", alt: product.imageAlt }]}
              productName={product.name}
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{product.name}</span>
              <span className="type-caption mt-0.5 block text-ink-muted" data-mono>
                SKU: {product.sku}
              </span>
            </span>
            <span className="type-small shrink-0 font-semibold tnum" data-numeric>
              {formatMoney(product.price)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
