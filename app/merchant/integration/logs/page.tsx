"use client";

import * as React from "react";
import { syncLogFor } from "@/lib/integration";
import { paginate } from "@/lib/merchant";
import { Tabs } from "@/components/ui";
import { FadeIn, Pagination, useMerchant } from "@/components/merchant";
import { IntegrationTabs, LogsTable } from "@/components/integration";

const PAGE_SIZE = 8;

type LogFilter = "ALL" | "SUCCESS" | "PENDING" | "FAILED";

export default function MerchantLogsPage() {
  const { merchant, merchantId, receipts, loading } = useMerchant();
  const [filter, setFilter] = React.useState<LogFilter>("ALL");
  const [page, setPage] = React.useState(1);

  const entries = React.useMemo(() => syncLogFor(receipts), [receipts]);
  const counts = React.useMemo(
    () => ({
      ALL: entries.length,
      SUCCESS: entries.filter((e) => e.status === "SUCCESS").length,
      PENDING: entries.filter((e) => e.status === "PENDING").length,
      FAILED: entries.filter((e) => e.status === "FAILED").length,
    }),
    [entries]
  );

  React.useEffect(() => {
    setPage(1);
  }, [filter, merchantId]);

  const filtered = filter === "ALL" ? entries : entries.filter((e) => e.status === filter);
  const { pageRows, page: safePage, pageCount } = paginate(filtered, page, PAGE_SIZE);

  return (
    <div className="flex flex-col gap-5">
      <FadeIn className="flex flex-col gap-4">
        <div>
          <p className="type-label text-[var(--r-primary)]">Integration · {merchant.name}</p>
          <h1 className="type-h1 mt-1">Sync logs</h1>
          <p className="type-small mt-1 max-w-2xl text-ink-muted">
            What the demo integration received from {merchant.posName} — newest first.
          </p>
        </div>
        <IntegrationTabs />
      </FadeIn>

      <FadeIn delay={0.05}>
        <Tabs
          ariaLabel="Filter logs by status"
          value={filter}
          onChange={(id) => setFilter(id as LogFilter)}
          tabs={[
            { id: "ALL", label: "All", count: counts.ALL },
            { id: "SUCCESS", label: "Success", count: counts.SUCCESS },
            { id: "PENDING", label: "Pending", count: counts.PENDING },
            { id: "FAILED", label: "Failed", count: counts.FAILED },
          ]}
        />
      </FadeIn>

      <FadeIn delay={0.08}>
        <LogsTable entries={pageRows} loading={loading} />
      </FadeIn>

      {!loading && (
        <Pagination page={safePage} pageCount={pageCount} total={filtered.length} noun="entries" onPage={setPage} />
      )}
    </div>
  );
}
