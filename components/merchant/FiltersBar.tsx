"use client";

import { Button, SearchInput, Select } from "@/components/ui";
import { activeFilterCount, DEFAULT_FILTERS, type ReceiptFilters } from "@/lib/merchant";

export function FiltersBar({
  filters,
  onChange,
  resultCount,
  totalCount,
  noun = "receipts",
}: {
  filters: ReceiptFilters;
  onChange: (f: ReceiptFilters) => void;
  resultCount: number;
  totalCount: number;
  noun?: string;
}) {
  const set = <K extends keyof ReceiptFilters>(key: K, value: ReceiptFilters[K]) =>
    onChange({ ...filters, [key]: value });
  const active = activeFilterCount(filters);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <SearchInput
          value={filters.q}
          onChange={(e) => set("q", e.target.value)}
          onClear={() => set("q", "")}
          placeholder="Search receipt, transaction, customer, product…"
          aria-label={`Search ${noun} by receipt ID, transaction ID, customer, or product`}
          className="sm:max-w-sm"
        />
        <span className="flex-1" />
        <p className="type-small self-center text-ink-muted tnum" role="status" aria-live="polite">
          {resultCount} of {totalCount} {noun}
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <Select
          aria-label="Filter by transaction status"
          value={filters.tx}
          onChange={(e) => set("tx", e.target.value as ReceiptFilters["tx"])}
          options={[
            { value: "ALL", label: "All statuses" },
            { value: "PAID", label: "Paid" },
            { value: "PARTIALLY_REFUNDED", label: "Partially refunded" },
            { value: "REFUNDED", label: "Refunded" },
          ]}
          className="w-44"
        />
        <Select
          aria-label="Filter by payment method"
          value={filters.payment}
          onChange={(e) => set("payment", e.target.value as ReceiptFilters["payment"])}
          options={[
            { value: "ALL", label: "All payments" },
            { value: "CARD", label: "Card" },
            { value: "CASH", label: "Cash" },
            { value: "DIGITAL", label: "Digital" },
          ]}
          className="w-40"
        />
        <Select
          aria-label="Filter by verification"
          value={filters.verification}
          onChange={(e) => set("verification", e.target.value as ReceiptFilters["verification"])}
          options={[
            { value: "ALL", label: "All verification" },
            { value: "VERIFIED", label: "Verified" },
            { value: "UNAVAILABLE", label: "Unavailable" },
          ]}
          className="w-44"
        />
        <Select
          aria-label="Filter by refund state"
          value={filters.refund}
          onChange={(e) => set("refund", e.target.value as ReceiptFilters["refund"])}
          options={[
            { value: "ALL", label: "All refunds" },
            { value: "NONE", label: "No refund" },
            { value: "PENDING", label: "Refund pending" },
            { value: "COMPLETED", label: "Refund completed" },
            { value: "FAILED", label: "Refund failed" },
          ]}
          className="w-44"
        />
        <Select
          aria-label="Filter by date"
          value={filters.date}
          onChange={(e) => set("date", e.target.value as ReceiptFilters["date"])}
          options={[
            { value: "ALL", label: "All dates" },
            { value: "TODAY", label: "Today" },
            { value: "7D", label: "Last 7 days" },
          ]}
          className="w-36"
        />
        <Select
          aria-label="Sort receipts"
          value={filters.sort}
          onChange={(e) => set("sort", e.target.value as ReceiptFilters["sort"])}
          options={[
            { value: "NEWEST", label: "Newest first" },
            { value: "OLDEST", label: "Oldest first" },
            { value: "AMOUNT_DESC", label: "Highest total" },
            { value: "AMOUNT_ASC", label: "Lowest total" },
          ]}
          className="w-40"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({ ...DEFAULT_FILTERS, sort: filters.sort })}
          disabled={active === 0}
        >
          {active > 0 ? `Clear filters (${active})` : "Clear filters"}
        </Button>
      </div>
    </div>
  );
}
