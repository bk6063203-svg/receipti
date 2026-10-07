# Receipti — Digital Receipt Infrastructure

> **Portals expansion: customer sidebar portal** (spending, receipts, wallet, alerts,
> refunds), **admin sidebar portal** (merchants, receipts, taxes, activity),
> **merchant settings + slip verification**, verify-by-receipt-number, and an
> overcharge demo seed. Local prototype, no backends, auth, payments, or
> government integrations.

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · Framer Motion ·
Lucide icons · `clsx` + `tailwind-merge`.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run typecheck
npm run lint
```

Key routes in Phase 01:

| Route | Purpose |
|---|---|
| `/` | Public landing page (hero → Experience portals → final CTA) |
| `/design-system` | Internal reference: every token & component |
| `/#product`, `/#how-it-works`, `/#customers`, `/#business`, `/#security`, `/#demo`, `/#get-started` | Landing anchors |
| `/how-it-works`, `/business`, `/security`, `/product`, `/customers`, `/merchants` | 307 redirects to landing anchors |
| `/verification` | 307 redirect to `/verify` |
| `/demo` | Demo hub: 3 end-to-end demos (customer / merchant / admin) on one dataset + global receipt search |
| `/demo/customer` | Demo 1 — customer storefront: shop → checkout → pay → print/QR/tap handoff → receipt (no verification) |
| `/demo/merchant-pos` | Demo 2 — simulated POS: sale → payment → receipt + QR, portal handoffs |
| `/demo/admin` | Demo 3 — admin live event feed: sales, refunds, approvals, fuel alerts in real time |
| `/receipt/[id]` | Rich receipt detail: header, product rows, status/payment/verification/returns/details cards (mobile-first) |
| `/demo/customer-receipt` | Demo index: one receipt per state |
| `/demo/fuel` | Fuel POS → receipt → transaction check (match/discrepancy demo) |
| `/demo/presentation` | Story deck: problem → solution → customer/merchant views → ecosystem → CTA |
| `/live` | Live Transaction Demo hub: merchant till, customer display, split screen (PKR) |
| `/live/merchant` | Live cashier POS: search, barcode scan, cart, discounts, charging |
| `/live/customer` | Live customer display: scanned items, GST, payable in real time |
| `/live/split` | Split screen: till + display side by side on one shared transaction |
| `/live/experience` | Guided investor demo: split screen + lifecycle stepper + narrated stages + Reset Demo |
| `/live/receipt/[token]` | Finalized live receipt by claim token (QR / NFC / wallet all resolve here) |
| `/live/wallet` | Customer receipt wallet: claimed receipts, details, remove-from-wallet (record stays) |
| `/live/verify` | Verify receipt by ID or QR claim link + activity log (public facts only) |
| `/live/history` | Merchant receipt history: own receipts, audit trail, refunds, voids |
| `supabase/migrations/0001_live_receipts.sql` | Receipt database schema (receipts, wallet, audit, verify log) + demo RLS |
| `/r/[ref]` | 307 redirect to `/receipt/[ref]` (legacy QR compat) |
| `/verify`, `/verify/[reference]` | Reference lookup + verification result |
| `/customer` | Customer portal: search, receipts, wallet preview, refunds (verification-free) |
| `/customer/wallet` | Saved receipts (removing hides — the trusted record stays) |
| `/customer/receipts` | All receipts: search + merchant filter |
| `/customer/alerts` | Spending alerts: overcharges, mismatches, fuel discrepancies |
| `/customer/refunds` | Refund status across receipts |
| `/customer/receipts/[id]` | 307 redirect to `/receipt/[id]` (shared detail, no duplicate page) |
| `/merchant` | Merchant dashboard overview (metrics, chart, recent, refunds, verification) |
| `/merchant/receipts` | Receipt records: search, filters, sort, pagination, detail dialog |
| `/merchant/transactions` | Payment lens: gross/refunded/net + method totals |
| `/merchant/refunds` | Refund events + approve action: PENDING requests → COMPLETED everywhere |
| `/merchant/verification` | Verification request log + summary |
| `/merchant/integration`, `/webhooks`, `/logs` | Integration demo: connection, API, mapping, sync, events, logs |
| `/merchant/integrations`, `/merchant/api-keys` | Redirects into the integration experience |
| `/merchant/settings` | Business profile, POS connection, notification prefs (on-device) |
| `/admin` | System overview: totals, health, previews (prototype-only) |
| `/admin/merchants` | Merchant database: receipts, revenue, tax, status |
| `/admin/receipts` | Receipt database: search, filter, inspect |
| `/admin/taxes` | Tax reported per merchant + reporting status |
| `/admin/activity` | Platform activity feed with filters |
| `/admin/notifications` | Notification center: sales, refund events, fuel alerts + unread badge |

## Architecture

```
app/                    # App Router — landing, stubs, design-system preview
components/
  ui/                   # Generic primitives (Button, Card, Modal, …)
  receipts/             # ReceiptCard, ReceiptStatus, lines, totals
  verification/         # VerificationState, QRPanel
  layout/               # Navigation, Footer, Logo, PortalSwitcher, PortalShell, PhaseStub
  landing/              # Landing sections (Hero → FinalCta) + Reveal/Flow
  pos/                  # POS prototype (catalog, cart, checkout, receipt)
  receipt/              # Customer receipt (view, rail, states)
  verify/               # Verification (landing, result, comparison, scan)
  refunds/              # Refund system (wizard, history, status pills)
  fuel/                 # Fuel demo (POS, receipt, transaction check)
  demo/                 # Demo hub (global receipt search)
  admin/                # System overview (prototype-only)
  customer/             # Customer portal (overview, receipts, wallet, alerts, refunds)
  dev/                  # Design-system showcase (internal)
lib/                    # utils, format, motion, status, data access
types/                  # Domain model (single source of truth)
data/                   # Mock fixtures (replace with API later)
hooks/                  # useMounted
```

## Product rules baked into the foundation

- **Transaction status ≠ verification status.** `VERIFIED + REFUNDED` is valid;
  they render as two independent badges (`ReceiptStatus`).
- **QR first.** `QRPanel` is the primary access channel; NFC stays future-only.
- **Wallet removal hides, never deletes.** Documented on `WalletEntry`.
- **Refunds are linked events** (`RefundTransaction`), never overwrites.
- **POS/ERP stays the source system**; Receipti stores the trusted record.
- **Money in minor units** (`Money.amountMinor`) with tabular-numeral display.
- **No payment processing** — branding/copy must never imply it.

## Design tokens

Single source: CSS variables in `app/globals.css`, mapped into
`tailwind.config.ts`. Brand palette is fixed — do not invent new brand colors.

## Conventions for Phase 02+

- Import UI from `@/components/ui` (barrel), never deep-copy styles.
- Demo data lives in `data/*`, overlaid with device-local stores (`lib/pos-store`, `lib/wallet-store`) — one source per domain, seeds first.
- Use `type-*` classes for typography, `container-x` / `section-y` for layout.
- Motion: `lib/motion.ts` variants only; content must never depend on animation.
- Status info always pairs icon + text (never color alone).

### Live sync backend (optional)

The Live Transaction Demo (`/live`) syncs through one shared transaction state. Same-browser
tabs always stay in sync. For cross-device sync, add Supabase Realtime broadcast credentials
(see `.env.example`) — no tables or SQL required:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Without these variables the screens show a “Same-browser sync” badge; with them, a “Live
backend” badge. Sync payloads are revision-guarded so stale updates never overwrite newer ones.

### Live receipts database

Finalized live receipts persist through a repository (`lib/receipt-repo.ts`) with two
implementations: Supabase Postgres when configured, otherwise a labeled local demo store
(browser only — never presented as production). The UI always shows which store is active.

To connect the shared database:

1. Create a Supabase project and run `supabase/migrations/0001_live_receipts.sql` in the SQL editor.
2. Add `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`.
3. Restart — wallet, verification, and history switch to Supabase automatically.

Design rules: one immutable record per payment (integrity-hashed); refunds/voids/claims are
separate audit events; wallet visibility is separate from receipt ownership; verification
returns public facts only.
