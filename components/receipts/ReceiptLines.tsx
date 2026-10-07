import type { Money, ReceiptItem, ReceiptTotals } from "@/types";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

function Row({
  label,
  value,
  strong = false,
  muted = false,
}: {
  label: string;
  value: Money;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={cn("type-small", strong ? "font-semibold text-ink" : muted ? "text-ink-faint" : "text-ink-muted")}>
        {label}
      </dt>
      <dd className={cn("type-small shrink-0", strong ? "type-amount text-base" : "tnum")} data-numeric>
        {formatMoney(value)}
      </dd>
    </div>
  );
}

/** Line-item breakdown for a receipt (reusable, page-agnostic). */
export function ReceiptLines({ items }: { items: ReceiptItem[] }) {
  return (
    <ul className="divide-y divide-[var(--r-line)]">
      {items.map((item) => (
        <li key={item.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">{item.name}</p>
            <p className="type-caption mt-0.5 text-ink-muted tnum">
              {item.quantity} × {formatMoney(item.unitPrice)}
              {item.sku && <span className="text-ink-faint"> · {item.sku}</span>}
            </p>
          </div>
          <p className="type-small shrink-0 font-semibold tnum" data-numeric>
            {formatMoney(item.lineTotal)}
          </p>
        </li>
      ))}
    </ul>
  );
}

/** Subtotal / discount / tax / grand-total block. */
export function ReceiptTotalsBlock({ totals }: { totals: ReceiptTotals }) {
  return (
    <dl className="flex flex-col gap-1.5 border-t border-dashed border-line pt-3">
      <Row label="Subtotal" value={totals.subtotal} />
      {totals.discountTotal.amountMinor > 0 && (
        <Row label="Discount" value={totals.discountTotal} muted />
      )}
      <Row label="Tax" value={totals.taxTotal} />
      <div className="mt-1.5 border-t border-line pt-2.5">
        <Row label="Total" value={totals.grandTotal} strong />
      </div>
    </dl>
  );
}
