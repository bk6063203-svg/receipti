"use client";

import * as React from "react";
import type { PosReceipt } from "@/types/pos";
import {
  DEFAULT_FILTERS,
  filterReceipts,
  paginate,
  type ReceiptFilters,
} from "@/lib/merchant";
import {
  FadeIn,
  FiltersBar,
  Pagination,
  ReceiptDetailDialog,
  ReceiptsTable,
  useMerchant,
} from "@/components/merchant";

const PAGE_SIZE = 6;

export default function MerchantReceiptsPage() {
  const { merchant, merchantId, receipts, loading, searchQuery, setSearchQuery } = useMerchant();
  const [filters, setFilters] = React.useState<ReceiptFilters>({ ...DEFAULT_FILTERS, q: searchQuery });
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<PosReceipt | null>(null);

  // Header search drives this page's query.
  React.useEffect(() => {
    setFilters((f) => (f.q === searchQuery ? f : { ...f, q: searchQuery }));
  }, [searchQuery]);

  React.useEffect(() => {
    setPage(1);
  }, [filters, merchantId]);

  const applyFilters = (f: ReceiptFilters) => {
    setFilters(f);
    if (f.q !== searchQuery) setSearchQuery(f.q);
  };

  const filtered = filterReceipts(receipts, filters);
  const { pageRows, page: safePage, pageCount } = paginate(filtered, page, PAGE_SIZE);

  return (
    <div className="flex flex-col gap-5">
      <FadeIn>
        <p className="type-label text-[var(--r-primary)]">{merchant.name}</p>
        <h1 className="type-h1 mt-1">Receipts</h1>
        <p className="type-small mt-1 text-ink-muted">
          Every digital receipt mirrored from {merchant.posName}, with delivery state.
        </p>
      </FadeIn>

      <FadeIn delay={0.05}>
        <FiltersBar
          filters={filters}
          onChange={applyFilters}
          resultCount={filtered.length}
          totalCount={receipts.length}
        />
      </FadeIn>

      <FadeIn delay={0.08}>
        <ReceiptsTable rows={pageRows} loading={loading} onView={setSelected} />
      </FadeIn>

      {!loading && (
        <Pagination page={safePage} pageCount={pageCount} total={filtered.length} noun="receipts" onPage={setPage} />
      )}

      <ReceiptDetailDialog receipt={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
