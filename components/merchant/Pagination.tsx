"use client";

import { Button } from "@/components/ui";

export function Pagination({
  page,
  pageCount,
  total,
  noun,
  onPage,
}: {
  page: number;
  pageCount: number;
  total: number;
  noun: string;
  onPage: (page: number) => void;
}) {
  if (pageCount <= 1) {
    return (
      <p className="type-small text-ink-muted tnum" role="status">
        {total} {noun}
      </p>
    );
  }
  return (
    <nav aria-label={`${noun} pages`} className="flex items-center justify-between gap-3">
      <p className="type-small text-ink-muted tnum" role="status">
        Page {page} of {pageCount} · {total} {noun}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPage(page + 1)}
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
