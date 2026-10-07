import * as React from "react";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";

export interface Column<T> {
  key: string;
  header: string;
  /** Render cell content. */
  render: (row: T) => React.ReactNode;
  align?: "left" | "right" | "center";
  numeric?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  loading?: boolean;
  caption?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

const ALIGN = { left: "text-left", right: "text-right", center: "text-center" } as const;

/**
 * Generic, typed data table.
 * Horizontally scrolls on small screens; sticky header optional via className.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  caption,
  emptyTitle = "No results",
  emptyDescription = "There is nothing to show here yet.",
  className,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={cn("surface-card overflow-hidden", className)}>
        <div className="p-5">
          <LoadingState variant="skeleton" lines={5} />
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} className={className} />;
  }

  return (
    <div className={cn("surface-card overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-line bg-background/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "type-label whitespace-nowrap px-4 py-3 font-semibold text-ink-muted",
                    ALIGN[col.align ?? "left"],
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={rowKey(row, i)}
                className="border-b border-line transition-colors last:border-0 hover:bg-background/70"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn("px-4 py-3.5 align-middle", ALIGN[col.align ?? "left"], col.numeric && "tnum", col.className)}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
