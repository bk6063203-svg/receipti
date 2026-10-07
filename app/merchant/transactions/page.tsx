"use client";

import * as React from "react";
import type { PosReceipt } from "@/types/pos";
import { formatMoney } from "@/lib/format";
import { aed } from "@/lib/pos";
import {
  DEFAULT_FILTERS,
  filterReceipts,
  methodTotals,
  paginate,
  type ReceiptFilters,
} from "@/lib/merchant";
import { Card } from "@/components/ui";
import {
  FadeIn,
  FiltersBar,
  Pagination,
  ReceiptDetailDialog,
  TransactionsTable,
  useMerchant,
} from "@/components/merchant";

const PAGE_SIZE = 6;

export default function MerchantTransactionsPage() {
  const { merchant, merchantId, receipts, loading } = useMerchant();
  const [filters, setFilters] = React.useState<ReceiptFilters>(DEFAULT_FILTERS);
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<PosReceipt | null>(null);

  React.useEffect(() => {
    setPage(1);
  }, [filters, merchantId]);

  const methods = methodTotals(receipts);
  const filtered = filterReceipts(receipts, filters);
  const { pageRows, page: safePage, pageCount } = paginate(filtered, page, PAGE_SIZE);

  return (
    <div className="flex flex-col gap-5">
      <FadeIn>
        <p className="type-label text-[var(--r-primary)]">{merchant.name}</p>
        <h1 className="type-h1 mt-1">Transactions</h1>
        <p className="type-small mt-1 text-ink-muted">
          The payment lens on the same records — gross, refunded, and net per transaction.
        </p>
      </FadeIn>

      {!loading && methods.length > 0 && (
        <FadeIn delay={0.05}>
          <Card as="section" aria-label="Totals by payment method">
            <h2 className="type-label text-ink-faint">By payment method</h2>
            <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {methods.map((m) => (
                <div key={m.method} className="flex items-center justify-between gap-3 rounded-xl bg-background px-4 py-3">
                  <div>
                    <dt className="text-sm font-semibold">{m.label}</dt>
                    <dd className="type-caption text-ink-muted tnum">
                      {m.count} transaction{m.count === 1 ? "" : "s"}
                    </dd>
                  </div>
                  <dd className="type-small font-bold tnum" data-numeric>
                    {formatMoney(aed(m.grossMinor))}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        </FadeIn>
      )}

      <FadeIn delay={0.06}>
        <FiltersBar
          filters={filters}
          onChange={setFilters}
          resultCount={filtered.length}
          totalCount={receipts.length}
          noun="transactions"
        />
      </FadeIn>

      <FadeIn delay={0.08}>
        <TransactionsTable rows={pageRows} loading={loading} onView={setSelected} />
      </FadeIn>

      {!loading && (
        <Pagination page={safePage} pageCount={pageCount} total={filtered.length} noun="transactions" onPage={setPage} />
      )}

      <ReceiptDetailDialog receipt={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
