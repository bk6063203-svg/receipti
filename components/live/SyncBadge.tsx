"use client";

import { cn } from "@/lib/utils";
import { useLive } from "./LiveProvider";

/** Honest sync indicator: remote backend when configured, same-browser demo otherwise. */
export function SyncBadge({ dark = false }: { dark?: boolean }) {
  const { mode } = useLive();
  const remote = mode === "remote";
  return (
    <span
      title={
        remote
          ? "Synced across devices via Supabase Realtime"
          : "Same-browser sync — cross-device sync requires Supabase setup (see /live)"
      }
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-bold",
        dark
          ? remote
            ? "bg-emerald-500/15 text-emerald-300"
            : "bg-amber-500/15 text-amber-300"
          : remote
            ? "bg-[var(--r-verified-muted)] text-[var(--r-verified)]"
            : "bg-[var(--r-warning-muted)] text-[var(--r-warning)]"
      )}
    >
      <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
        {remote && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
        )}
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
      </span>
      {remote ? "Live backend" : "Same-browser sync"}
    </span>
  );
}
