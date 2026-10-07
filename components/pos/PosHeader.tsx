"use client";

import * as React from "react";
import { Store } from "lucide-react";
import { Badge } from "@/components/ui";
import { POS_BRANCH, POS_MERCHANT } from "@/data/pos-catalog";
import { peekSequence } from "@/lib/pos-store";
import { useMounted } from "@/hooks/use-mounted";

export function PosHeader() {
  const mounted = useMounted();
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setNow(new Date());
    const t = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--r-dark)] text-[var(--r-on-dark)]">
          <Store className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-lg font-bold leading-tight tracking-tight">{POS_MERCHANT}</h1>
          <p className="type-small text-ink-muted">
            {POS_BRANCH} · New Sale
            {mounted && now && (
              <span className="tnum">
                {" · "}
                {now.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                {" · "}
                {now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge tone="neutral" dot>
          Register 01
        </Badge>
        {mounted && (
          <Badge tone="neutral" dot>
            Sale #{peekSequence()}
          </Badge>
        )}
      </div>
    </div>
  );
}
