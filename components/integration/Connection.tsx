"use client";

import * as React from "react";
import { Check, Copy, Plug } from "lucide-react";
import type { Merchant } from "@/types/merchant";
import type { PosReceipt } from "@/types/pos";
import { formatDateTime } from "@/lib/format";
import { DEMO_API_BASE, DEMO_API_KEY_MASKED, syncStatsFor } from "@/lib/integration";
import { Button, Card, Modal, useToast } from "@/components/ui";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        } catch {
          toast({ title: "Copy unavailable", description: "Select the value manually.", tone: "error" });
        }
      }}
      leftIcon={
        copied ? (
          <Check className="h-3.5 w-3.5 text-[var(--r-verified)]" aria-hidden="true" />
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
        )
      }
    >
      {copied ? "Copied" : label}
    </Button>
  );
}

export function TestConnectionButton({ size = "sm" }: { size?: "sm" | "md" }) {
  const [stage, setStage] = React.useState<"idle" | "testing" | "connected">("idle");
  const timer = React.useRef<number | null>(null);
  React.useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Button
        variant={stage === "connected" ? "secondary" : "primary"}
        size={size}
        disabled={stage === "testing"}
        loading={stage === "testing"}
        onClick={() => {
          setStage("testing");
          timer.current = window.setTimeout(() => setStage("connected"), 1100);
        }}
      >
        {stage === "testing" ? "Testing…" : stage === "connected" ? "Connection OK" : "Test connection"}
      </Button>
      <span aria-live="polite">
        {stage === "connected" && (
          <span className="type-status inline-flex items-center gap-1.5 rounded-full bg-[var(--r-verified-muted)] px-2.5 py-1 text-[var(--r-verified)]">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Demo endpoint reachable (simulated)
          </span>
        )}
      </span>
    </span>
  );
}

export function ConnectionCard({ merchant, receipts }: { merchant: Merchant; receipts: PosReceipt[] }) {
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const stats = syncStatsFor(receipts);

  return (
    <>
      <Card as="section" aria-label="Receipti connection status" className="h-full">
        <p className="type-label text-ink-faint">Receipti connection</p>
        <h2 className="mt-1 flex items-center gap-2 text-[0.9375rem] font-semibold">
          <Plug className="h-4 w-4 text-ink-muted" aria-hidden="true" />
          {merchant.posName}
        </h2>
        <p className="mt-2 flex flex-wrap items-center gap-2">
          <span className="type-status inline-flex items-center gap-1.5 rounded-full bg-[var(--r-verified-muted)] px-2.5 py-1 text-[var(--r-verified)]">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--r-verified)] opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--r-verified)]" />
            </span>
            Connected (demo)
          </span>
        </p>
        <dl className="type-small mt-3 space-y-1.5 text-ink-muted">
          <div className="flex justify-between gap-3">
            <dt>Last synchronized</dt>
            <dd className="font-semibold text-ink tnum">
              {stats.lastSync ? formatDateTime(stats.lastSync) : "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Receipts synchronized</dt>
            <dd className="font-semibold text-ink tnum" data-numeric>{stats.received}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Connection</dt>
            <dd className="font-semibold text-ink">Active</dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setDetailsOpen(true)}>
            View details
          </Button>
          <TestConnectionButton />
        </div>
      </Card>

      <Modal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title="Connection details"
        description={`${merchant.posName} → Receipti (demo)`}
        footer={
          <Button variant="outline" onClick={() => setDetailsOpen(false)}>
            Close
          </Button>
        }
      >
        <dl className="type-small grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {[
            ["Environment", "Demo"],
            ["Endpoint", DEMO_API_BASE],
            ["API key", DEMO_API_KEY_MASKED],
            ["Last synchronized", stats.lastSync ? formatDateTime(stats.lastSync) : "—"],
            ["Receipts synchronized", String(stats.received)],
            ["Failed events", String(stats.failed)],
          ].map(([term, value]) => (
            <div key={term} className="rounded-xl bg-background px-3.5 py-2.5">
              <dt className="type-caption text-ink-faint">{term}</dt>
              <dd className="mt-0.5 truncate font-semibold" data-mono={term === "Endpoint" || term === "API key" ? "" : undefined}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="type-caption mt-3 rounded-xl bg-background px-3.5 py-2.5 text-ink-muted">
          Demo values only — nothing here connects to a live system.
        </p>
      </Modal>
    </>
  );
}
