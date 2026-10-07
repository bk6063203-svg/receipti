"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getRepository, type RepoMode } from "@/lib/receipt-repo";

/**
 * Honest persistence indicator. "Demo store" means records live in this
 * browser only — it is never presented as the production database.
 */
export function DbModeBadge() {
  const [mode, setMode] = React.useState<RepoMode | null>(null);

  React.useEffect(() => {
    let live = true;
    getRepository()
      .then((r) => {
        if (live) setMode(r.mode);
      })
      .catch(() => {
        if (live) setMode("local");
      });
    return () => {
      live = false;
    };
  }, []);

  if (!mode) {
    return (
      <span className="inline-flex animate-pulse items-center rounded-full bg-background px-2.5 py-1 text-[0.6875rem] font-bold text-ink-faint">
        Checking store…
      </span>
    );
  }
  const remote = mode === "supabase";
  return (
    <span
      title={
        remote
          ? "Receipts persist in the shared Supabase database"
          : "Demo store: records persist in this browser only — connect Supabase for the shared database (see /live)"
      }
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-bold",
        remote
          ? "bg-[var(--r-verified-muted)] text-[var(--r-verified)]"
          : "bg-[var(--r-warning-muted)] text-[var(--r-warning)]"
      )}
    >
      <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
      </span>
      {remote ? "Supabase database" : "Demo store"}
    </span>
  );
}
