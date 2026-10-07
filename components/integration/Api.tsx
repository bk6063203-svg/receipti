"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Copy, Eye, EyeOff, RotateCw } from "lucide-react";
import type { PosReceipt } from "@/types/pos";
import { receiptTxState } from "@/lib/pos";
import { DEMO_API_BASE, DEMO_API_KEY_FULL, DEMO_API_KEY_MASKED } from "@/lib/integration";
import { Badge, Button, Card, Tabs, useToast } from "@/components/ui";
import { CopyButton, TestConnectionButton } from "./Connection";

/* ---------------- JSON code block ---------------- */

function highlightJson(source: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /("(?:[^"\\]|\\.)*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(source)) !== null) {
    if (m.index > last) {
      out.push(
        <span key={`p-${k++}`} className="text-[#8A8F98]">
          {source.slice(last, m.index)}
        </span>
      );
    }
    const full = m[0];
    const str = m[1] as string | undefined;
    const colon = m[2] as string | undefined;
    if (str !== undefined) {
      const isKey = colon !== undefined;
      out.push(
        <span key={`s-${k++}`} className={isKey ? "text-[#20C997]" : "text-[#E2E8F0]"}>
          {str}
        </span>
      );
      if (colon !== undefined) {
        out.push(
          <span key={`c-${k++}`} className="text-[#8A8F98]">
            {colon}
          </span>
        );
      }
    } else {
      out.push(
        <span key={`n-${k++}`} className="text-white">
          {full}
        </span>
      );
    }
    last = m.index + full.length;
  }
  if (last < source.length) {
    out.push(
      <span key={`p-${k++}`} className="text-[#8A8F98]">
        {source.slice(last)}
      </span>
    );
  }
  return out;
}

export function CodeBlock({ code, label }: { code: string; label: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);
  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-[#171717]">
      <figcaption className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-2">
        <span className="type-caption font-semibold text-[#E2E8F0]">{label}</span>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            } catch {
              toast({ title: "Copy unavailable", description: "Select the code manually.", tone: "error" });
            }
          }}
          aria-label={copied ? "Code copied" : `Copy ${label}`}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-[#E2E8F0] transition-colors hover:bg-white/10"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-[#20C997]" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </figcaption>
      <pre
        tabIndex={0}
        aria-label={`${label} code sample`}
        className="max-w-full overflow-x-auto p-4 font-mono text-[0.8125rem] leading-relaxed"
      >
        <code>{highlightJson(code)}</code>
      </pre>
    </figure>
  );
}

/* ---------------- API setup ---------------- */

export function ApiSetupCard({ receipt }: { receipt: PosReceipt | undefined }) {
  const { toast } = useToast();
  const [revealed, setRevealed] = React.useState(false);
  const [rotated, setRotated] = React.useState(false);

  return (
    <Card as="section" aria-label="API connection" id="api-keys" className="h-full scroll-mt-24">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[0.9375rem] font-semibold">API connection</h2>
        <Badge tone="success">Demo environment</Badge>
      </div>
      <dl className="mt-3 space-y-2.5">
        <div className="flex items-center justify-between gap-3">
          <dt className="type-small text-ink-muted">Environment</dt>
          <dd>
            <span className="type-status inline-flex items-center rounded-full bg-[var(--r-primary-muted)] px-2.5 py-1 text-[var(--r-primary)]">
              DEMO
            </span>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="type-small shrink-0 text-ink-muted">Endpoint</dt>
          <dd className="flex min-w-0 items-center gap-2">
            <span className="truncate text-[0.8125rem] font-semibold" data-mono>
              {DEMO_API_BASE}/receipts
            </span>
            <CopyButton value={`${DEMO_API_BASE}/receipts`} label="Copy" />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="type-small shrink-0 text-ink-muted">API key</dt>
          <dd className="flex min-w-0 items-center gap-2">
            <span className="truncate text-[0.8125rem] font-semibold" data-mono aria-live="polite">
              {revealed ? DEMO_API_KEY_FULL : DEMO_API_KEY_MASKED}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRevealed((v) => !v)}
              aria-pressed={revealed}
              aria-label={revealed ? "Hide demo API key" : "Reveal demo API key"}
              leftIcon={
                revealed ? (
                  <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                )
              }
            >
              {revealed ? "Hide" : "Reveal"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setRotated(true);
                setRevealed(false);
                toast({ title: "Key rotated (demo)", description: "A new fake key was issued.", tone: "success" });
              }}
              aria-label="Rotate demo API key (simulated)"
              leftIcon={<RotateCw className="h-3.5 w-3.5" aria-hidden="true" />}
            >
              Rotate
            </Button>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="type-small text-ink-muted">Status</dt>
          <dd>
            <span className="type-status inline-flex items-center gap-1.5 rounded-full bg-[var(--r-verified-muted)] px-2.5 py-1 text-[var(--r-verified)]">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Connected
            </span>
          </dd>
        </div>
      </dl>
      {rotated && (
        <p className="type-caption mt-2 text-ink-muted" role="status">
          Rotation simulated — the masked key above still identifies this demo only.
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <TestConnectionButton />
        <a href="#docs">
          <Button variant="outline" size="sm">
            View documentation
          </Button>
        </a>
      </div>
      <p className="type-caption mt-3 text-ink-faint">
        Mock values{receipt ? ` · examples use ${receipt.id}` : ""}. Never a real secret —
        nothing here leaves the browser.
      </p>
    </Card>
  );
}

/* ---------------- endpoint preview ---------------- */

function buildExamples(receipt: PosReceipt | undefined) {
  const r = receipt;
  const createRequest = {
    merchantTransactionId: r?.transactionId ?? "TXN-…",
    currency: r?.currency ?? "AED",
    subtotal: r ? r.subtotalMinor / 100 : 0,
    discount: r ? r.discountMinor / 100 : 0,
    tax: r ? r.taxMinor / 100 : 0,
    total: r ? r.totalMinor / 100 : 0,
    items: (r?.lines ?? []).slice(0, 2).map((l) => ({
      sku: l.sku,
      name: l.name,
      quantity: l.quantity,
      unitPrice: l.unitMinor / 100,
    })),
    payment: {
      method: r?.paymentMethod ?? "CARD",
      status: "PAID",
    },
  };
  const createResponse = {
    receiptId: r?.id ?? "RCPT-…",
    reference: r?.reference ?? "RCP_…",
    status: "created",
  };
  const refundRequest = {
    receiptId: r?.id ?? "RCPT-…",
    merchantTransactionId: r?.transactionId ?? "TXN-…",
    amount: 45.0,
    reason: "Item returned",
  };
  const refundResponse = { refundId: "RF-001", receiptId: r?.id ?? "RCPT-…", status: "recorded" };
  const retrieveResponse = {
    receiptId: r?.id ?? "RCPT-…",
    status: r ? receiptTxState(r) : "PAID",
    total: r ? r.totalMinor / 100 : 0,
    verification: r?.verification ?? "VERIFIED",
  };
  return { createRequest, createResponse, refundRequest, refundResponse, retrieveResponse };
}

export function EndpointPreview({ receipt }: { receipt: PosReceipt | undefined }) {
  const [tab, setTab] = React.useState("create");
  const ex = buildExamples(receipt);
  const show = (v: unknown) => JSON.stringify(v, null, 2);

  return (
    <Card as="section" aria-label="API endpoint preview" className="h-full">
      <h2 className="text-[0.9375rem] font-semibold">Endpoint preview</h2>
      <p className="type-small mt-1 text-ink-muted">
        Conceptual calls built from {receipt ? <span data-mono>{receipt.id}</span> : "demo data"} —
        no real API runs behind them.
      </p>
      <div className="mt-3">
        <Tabs
          ariaLabel="Endpoint examples"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "create", label: "Create receipt" },
            { id: "refund", label: "Record refund" },
            { id: "retrieve", label: "Retrieve receipt" },
          ]}
        />
      </div>
      <div className="mt-3 flex flex-col gap-3" role="tabpanel" aria-label="Endpoint example">
        {tab === "create" && (
          <>
            <p>
              <span className="type-status inline-flex items-center rounded-md bg-[var(--r-primary)] px-2 py-0.5 font-mono text-[0.75rem] font-bold text-white">
                POST
              </span>{" "}
              <span className="font-mono text-[0.8125rem] font-semibold">/v1/receipts</span>
            </p>
            <CodeBlock code={show(ex.createRequest)} label="Request" />
            <CodeBlock code={show(ex.createResponse)} label="Response · 201" />
          </>
        )}
        {tab === "refund" && (
          <>
            <p>
              <span className="type-status inline-flex items-center rounded-md bg-[var(--r-primary)] px-2 py-0.5 font-mono text-[0.75rem] font-bold text-white">
                POST
              </span>{" "}
              <span className="font-mono text-[0.8125rem] font-semibold">/v1/refunds</span>
            </p>
            <CodeBlock code={show(ex.refundRequest)} label="Request" />
            <CodeBlock code={show(ex.refundResponse)} label="Response · 201" />
          </>
        )}
        {tab === "retrieve" && (
          <>
            <p>
              <span className="type-status inline-flex items-center rounded-md bg-[var(--r-info)] px-2 py-0.5 font-mono text-[0.75rem] font-bold text-white">
                GET
              </span>{" "}
              <span className="font-mono text-[0.8125rem] font-semibold">/v1/receipts/:id</span>
            </p>
            <CodeBlock code={show(ex.retrieveResponse)} label="Response · 200" />
          </>
        )}
      </div>
    </Card>
  );
}

/* ---------------- docs preview ---------------- */

const DOCS: { category: string; rows: { sig: string; what: string }[] }[] = [
  {
    category: "Authentication",
    rows: [
      { sig: "Authorization: Bearer rct_demo_…", what: "Demo keys authenticate the merchant workspace." },
      { sig: "POST /v1/auth/keys:rotate", what: "Rotate a compromised demo key (simulated)." },
    ],
  },
  {
    category: "Receipts",
    rows: [
      { sig: "POST /v1/receipts", what: "Create a digital receipt from a transaction." },
      { sig: "GET /v1/receipts/:id", what: "Retrieve a receipt record." },
    ],
  },
  {
    category: "Transactions",
    rows: [
      { sig: "GET /v1/transactions", what: "List mirrored payment transactions." },
      { sig: "GET /v1/transactions/:id", what: "Read gross, refunded, and net." },
    ],
  },
  {
    category: "Refunds",
    rows: [
      { sig: "POST /v1/refunds", what: "Record a refund event against a receipt." },
      { sig: "GET /v1/refunds/:id", what: "Track a refund's lifecycle state." },
    ],
  },
  {
    category: "Webhooks",
    rows: [
      { sig: "GET /v1/webhooks/events", what: "List deliveries and their status." },
      { sig: "POST /v1/webhooks/:id/retry", what: "Requeue a failed delivery (simulated)." },
    ],
  },
  {
    category: "Errors",
    rows: [
      { sig: "{ code, message, retryable }", what: "Every error names its cause and retry policy." },
      { sig: "429 rate_limited", what: "Back off and retry with the same idempotency key." },
    ],
  },
];

export function DocsPreview() {
  return (
    <Card as="section" aria-label="API documentation preview" id="docs" className="scroll-mt-24">
      <h2 className="text-[0.9375rem] font-semibold">Documentation preview</h2>
      <p className="type-small mt-1 text-ink-muted">
        The shape of the Receipti API — conceptual only, none of these endpoints are live.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DOCS.map((d) => (
          <div key={d.category} className="rounded-xl border border-line p-4">
            <h3 className="type-label text-[var(--r-primary)]">{d.category}</h3>
            <ul className="mt-2.5 flex flex-col gap-2.5">
              {d.rows.map((r) => (
                <li key={r.sig}>
                  <p className="truncate font-mono text-[0.8125rem] font-semibold" title={r.sig}>
                    {r.sig}
                  </p>
                  <p className="type-caption mt-0.5 text-ink-muted">{r.what}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="type-caption mt-4 text-ink-faint">
        Full reference, SDKs, and changelogs ship with the production API — this page
        previews the concepts. See <Link href="/merchant/integration/logs" className="font-semibold text-[var(--r-primary)] underline underline-offset-2">sync logs</Link> for
        the demo event trail.
      </p>
    </Card>
  );
}
