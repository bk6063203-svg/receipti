"use client";

import * as React from "react";
import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  Download,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  Settings,
  Trash2,
  TrendingUp,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  Dialog,
  Divider,
  Dropdown,
  EmptyState,
  IconButton,
  Input,
  Modal,
  SearchInput,
  SectionHeader,
  Select,
  StatCard,
  Tabs,
  Tooltip,
  TransactionStatusBadge,
  VerificationStatusBadge,
  useToast,
} from "@/components/ui";
import { ReceiptCard, ReceiptLines, ReceiptTotalsBlock, ReceiptStatus } from "@/components/receipts";
import { QRPanel, VerificationState } from "@/components/verification";
import { mockReceipts } from "@/data/mock";
import { formatDate, formatMoney } from "@/lib/format";
import type { TransactionStatus, VerificationStatus } from "@/types";

const SWATCHES = [
  { name: "Background", hex: "#F7F7F5", fg: "#111111" },
  { name: "Card", hex: "#FFFFFF", fg: "#111111", border: true },
  { name: "Primary", hex: "#087F5B", fg: "#FFFFFF" },
  { name: "Accent", hex: "#20C997", fg: "#06281E" },
  { name: "Ink", hex: "#111111", fg: "#FFFFFF" },
  { name: "Muted", hex: "#6B7280", fg: "#FFFFFF" },
  { name: "Dark", hex: "#171717", fg: "#F5F5F4" },
  { name: "Verified", hex: "#16A34A", fg: "#FFFFFF" },
  { name: "Error", hex: "#DC2626", fg: "#FFFFFF" },
  { name: "Border", hex: "#E2E8F0", fg: "#111111", border: true },
] as const;

const TX: TransactionStatus[] = ["PAID", "PARTIALLY_PAID", "REFUNDED", "PENDING", "VOID", "REVERSED"];
const VF: VerificationStatus[] = ["VERIFIED", "INVALID", "TAMPER_DETECTED", "UNAVAILABLE"];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <h2 id={id} className="type-h3">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function DesignSystemDemo() {
  const { toast } = useToast();
  const [tab, setTab] = React.useState("receipts");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [select, setSelect] = React.useState("all");
  const [sample] = React.useState(() => mockReceipts[0]!);
  const [refunded] = React.useState(() => mockReceipts[1]!);

  return (
    <div className="flex flex-col gap-12">
      {/* COLOR */}
      <Section id="ds-color" title="Color tokens">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {SWATCHES.map((s) => (
            <div
              key={s.name}
              className="overflow-hidden rounded-xl border border-line bg-[var(--r-card)]"
            >
              <div
                className="flex h-20 items-end p-2.5"
                style={{ background: s.hex, color: s.fg }}
              >
                <span className="type-caption font-semibold tnum">{s.hex}</span>
              </div>
              <p className="type-small px-2.5 py-2 font-medium">{s.name}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* TYPE */}
      <Section id="ds-type" title="Typography scale">
        <Card>
          <p className="type-display">Display — trusted receipts</p>
          <p className="type-h1 mt-4">H1 — Wallet balance overview</p>
          <p className="type-h2 mt-4">H2 — Recent receipts</p>
          <p className="type-h3 mt-4">H3 — Receipt RCP-2026-004213</p>
          <p className="type-body mt-4 text-ink-muted">
            Body — Receipti stores the trusted record while your POS stays the source system.
          </p>
          <p className="type-small mt-2 text-ink-muted">Small — Issued 20 Sep 2026 · DHA Phase 5 Branch</p>
          <p className="type-caption mt-2 text-ink-faint">Caption — QR reference · Verification log</p>
          <p className="type-label mt-3 text-[var(--r-primary)]">Label — payment method</p>
          <p className="type-amount mt-2 text-2xl" data-numeric>
            {formatMoney(sample.totals.grandTotal)}
          </p>
          <p className="type-status mt-2 text-[var(--r-verified)]">Status — verified</p>
        </Card>
      </Section>

      {/* BUTTONS */}
      <Section id="ds-buttons" title="Buttons">
        <Card className="flex flex-wrap items-center gap-2.5">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="dark">Dark</Button>
          <Button loading>Loading</Button>
          <Button leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />} rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
            With icons
          </Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <IconButton label="Notifications">
            <Bell className="h-5 w-5" aria-hidden="true" />
          </IconButton>
          <IconButton label="Edit" variant="outline">
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </IconButton>
        </Card>
      </Section>

      {/* STATUS */}
      <Section id="ds-status" title="Status system — transaction ≠ verification">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Transaction status</CardTitle>
                <CardDescription>What happened to the money.</CardDescription>
              </div>
            </CardHeader>
            <div className="flex flex-wrap gap-2">
              {TX.map((s) => (
                <TransactionStatusBadge key={s} status={s} />
              ))}
            </div>
          </Card>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Verification status</CardTitle>
                <CardDescription>Is the record trustworthy?</CardDescription>
              </div>
            </CardHeader>
            <div className="flex flex-wrap gap-2">
              {VF.map((s) => (
                <VerificationStatusBadge key={s} status={s} />
              ))}
            </div>
          </Card>
        </div>
        <Card className="flex flex-wrap items-center gap-3">
          <span className="type-small font-medium">Valid combination:</span>
          <ReceiptStatus status="REFUNDED" verification="VERIFIED" />
          <span className="type-caption text-ink-faint">— verified + refunded is a normal state</span>
        </Card>
      </Section>

      {/* FORMS */}
      <Section id="ds-forms" title="Forms">
        <Card className="grid gap-4 sm:grid-cols-2">
          <Input label="Merchant name" placeholder="City Fresh Mart" hint="As it appears on receipts." />
          <Input label="Email" type="email" placeholder="owner@shop.pk" error="Enter a valid email address." />
          <SearchInput label="Search receipts" placeholder="Receipt no, merchant…" value={query} onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery("")} />
          <Select
            label="Status filter"
            value={select}
            onChange={(e) => setSelect(e.target.value)}
            options={[
              { value: "all", label: "All statuses" },
              { value: "paid", label: "Paid" },
              { value: "refunded", label: "Refunded" },
              { value: "pending", label: "Pending", disabled: true },
            ]}
          />
        </Card>
      </Section>

      {/* INTERACTIVE */}
      <Section id="ds-interactive" title="Tabs · Dropdown · Modal · Dialog · Toast · Tooltip">
        <Card className="flex flex-col gap-5">
          <Tabs
            ariaLabel="Demo tabs"
            value={tab}
            onChange={setTab}
            tabs={[
              { id: "receipts", label: "Receipts", count: 128 },
              { id: "refunds", label: "Refunds", count: 4 },
              { id: "archived", label: "Archived", disabled: true },
            ]}
          />
          <div className="flex flex-wrap items-center gap-2.5">
            <Dropdown
              label="Receipt actions"
              align="left"
              trigger={
                <Button variant="outline" rightIcon={<ChevronDown className="h-4 w-4" aria-hidden="true" />}>
                  Actions
                </Button>
              }
              items={[
                { id: "download", label: "Download PDF", icon: <Download className="h-4 w-4" aria-hidden="true" /> },
                { id: "edit", label: "Edit notes", icon: <Pencil className="h-4 w-4" aria-hidden="true" /> },
                { id: "delete", label: "Remove from wallet", destructive: true, icon: <Trash2 className="h-4 w-4" aria-hidden="true" /> },
              ]}
              onSelect={(id) => toast({ title: "Action selected", description: id, tone: "info" })}
            />
            <Button variant="outline" onClick={() => setModalOpen(true)}>
              Open modal
            </Button>
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              Open dialog
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast({ title: "Receipt verified", description: "RCP-2026-004213 matches the trusted record.", tone: "success" })}
            >
              Toast: success
            </Button>
            <Button
              variant="ghost"
              onClick={() => toast({ title: "Verification unavailable", description: "Try again in a moment.", tone: "error" })}
            >
              Toast: error
            </Button>
            <Tooltip content="Scoped keys never expose full secrets to clients.">
              <span className="inline-flex cursor-help items-center gap-1.5 rounded-lg border border-dashed border-line px-3 py-2 text-sm text-ink-muted">
                <Settings className="h-4 w-4" aria-hidden="true" /> Hover or focus me
              </span>
            </Tooltip>
          </div>
        </Card>
      </Section>

      {/* DATA */}
      <Section id="ds-data" title="Stats · Table · Avatars · Breadcrumb · Badges">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Receipts issued" value="1,284" icon={<ReceiptText className="h-4 w-4" aria-hidden="true" />} trend={{ direction: "up", value: "+12%" }} hint="vs last week" />
          <StatCard label="Verified" value="99.2%" icon={<Check className="h-4 w-4" aria-hidden="true" />} hint="of checks pass" />
          <StatCard label="Refunds" value="36" trend={{ direction: "down", value: "-4", positive: true }} hint="this month" />
          <StatCard label="Volume" value="Rs 4.2M" icon={<TrendingUp className="h-4 w-4" aria-hidden="true" />} hint="gross merchandise" />
        </div>
        <DataTable
          caption="Sample receipts"
          columns={[
            { key: "no", header: "Receipt", render: (r) => <span className="font-medium" data-mono>{r.receiptNumber}</span> },
            { key: "m", header: "Merchant", render: (r) => r.merchant.name },
            { key: "d", header: "Issued", render: (r) => formatDate(r.issuedAt) },
            { key: "s", header: "Status", render: (r) => <TransactionStatusBadge status={r.status} /> },
            { key: "v", header: "Verification", render: (r) => <VerificationStatusBadge status={r.verification} /> },
            { key: "t", header: "Total", align: "right", numeric: true, render: (r) => <span className="font-semibold">{formatMoney(r.totals.grandTotal)}</span> },
          ]}
          rows={mockReceipts}
          rowKey={(r) => r.id}
        />
        <Card className="flex flex-wrap items-center gap-4">
          <span className="flex -space-x-2">
            <Avatar name="Ayesha Khan" size="sm" />
            <Avatar name="Bilal Ahmed" size="sm" />
            <Avatar name="City Fresh Mart" size="sm" />
          </span>
          <Divider label="or" className="min-w-[8rem] flex-1" />
          <Breadcrumb items={[{ label: "Wallet", href: "/customer/wallet" }, { label: sample.receiptNumber }]} />
          <span className="flex gap-1.5">
            <Badge tone="primary" dot>POS-linked</Badge>
            <Badge tone="dark">NFC-ready</Badge>
          </span>
        </Card>
        <SectionHeader eyebrow="Preview" title="Section headers group content" description="Used above every major content block on future pages." />
      </Section>

      {/* RECEIPTS */}
      <Section id="ds-receipts" title="Receipt primitives">
        <div className="grid gap-4 lg:grid-cols-2">
          <ReceiptCard receipt={sample} href="/customer/receipts/r-001" />
          <ReceiptCard receipt={refunded} />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card as="article" padding="lg" className="lg:col-span-2">
            <p className="type-label text-ink-muted">Items · {sample.items.length}</p>
            <div className="mt-3">
              <ReceiptLines items={sample.items} />
            </div>
            <div className="mt-4">
              <ReceiptTotalsBlock totals={sample.totals} />
            </div>
          </Card>
          <Card className="flex items-center justify-center">
            <QRPanel payload={sample.qrPayload} />
          </Card>
        </div>
      </Section>

      {/* VERIFICATION */}
      <Section id="ds-verify" title="Verification states">
        <div className="grid gap-4 sm:grid-cols-2">
          <VerificationState status="VERIFIED" checkedAt={sample.verifiedAt} />
          <VerificationState status="TAMPER_DETECTED" checkedAt="2026-09-22T09:14:00+05:00" />
          <VerificationState status="INVALID" checkedAt="2026-09-22T09:14:00+05:00" />
          <VerificationState status="UNAVAILABLE" />
        </div>
      </Section>

      {/* EMPTY */}
      <Section id="ds-empty" title="Empty state">
        <EmptyState
          icon={<Search className="h-6 w-6" aria-hidden="true" />}
          title="No receipts found"
          description="Try a different receipt number, merchant, or date range."
          action={<Button variant="outline">Clear filters</Button>}
        />
      </Section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Receipt details"
        description="Modals trap focus, close on Escape, and respect reduced motion."
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Close</Button>
            <Button onClick={() => setModalOpen(false)}>Done</Button>
          </>
        }
      >
        <ReceiptLines items={sample.items.slice(0, 2)} />
      </Modal>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={() => {
          setDialogOpen(false);
          toast({ title: "Removed from wallet", description: "The trusted record is preserved.", tone: "success" });
        }}
        title="Remove from wallet?"
        description="This hides the receipt for you only. The authoritative Receipti record is never deleted."
        confirmLabel="Remove"
        tone="danger"
      />
    </div>
  );
}
