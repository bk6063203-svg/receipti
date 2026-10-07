import { ReceiptText } from "lucide-react";
import { cn } from "@/lib/utils";

/** Receipti wordmark — single source for logo usage. */
export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--r-primary)] text-white">
        <ReceiptText className="h-4 w-4" aria-hidden="true" />
      </span>
      {!compact && (
        <span className="text-[1.0625rem] font-bold tracking-tight text-ink">
          Receipti
        </span>
      )}
    </span>
  );
}
