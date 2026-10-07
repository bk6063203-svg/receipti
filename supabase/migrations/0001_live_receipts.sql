-- Receipti Live Transaction Demo — receipt database.
-- Run this in the Supabase SQL editor (or `supabase db push`), then set
-- NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.example).
--
-- PRODUCTION NOTES (demo-grade as shipped):
-- 1. RLS policies below are intentionally open for the prototype anon key.
--    Production must scope live_receipts by authenticated merchant/customer,
--    and expose verification through a dedicated RPC/view that returns public
--    facts only (never customer_id / claim_token).
-- 2. Refund/void/claim transitions should move into atomic Postgres functions
--    (SELECT .. FOR UPDATE) instead of client read-modify-write.
-- 3. The integrity hash should be computed server-side (trigger or Edge
--    Function) so clients cannot forge it.

-- ---------- finalized receipts: ONE row per confirmed payment ----------
create table if not exists live_receipts (
  receipt_id text primary key,
  merchant_id text not null,
  merchant_name text not null,
  transaction_id text not null,
  created_at timestamptz not null,
  issued_at timestamptz not null,
  lines jsonb not null,
  currency text not null default 'PKR',
  subtotal_minor integer not null,
  discount_minor integer not null,
  discount_label text not null default '',
  tax_minor integer not null,
  tax_pct integer not null,
  total_minor integer not null,
  refunded_minor integer not null default 0,
  method text not null,
  payment_status text not null,
  receipt_status text not null,
  customer_id text,
  claim_token text unique not null,
  claim_method text,
  claimed_at timestamptz,
  integrity text not null,
  rev integer not null default 1
);
create index if not exists live_receipts_merchant_idx
  on live_receipts (merchant_id, issued_at desc);

-- ---------- wallet visibility: separate from the receipt itself ----------
-- Removing a wallet row (hidden = true) never deletes the receipt.
create table if not exists live_wallet (
  id uuid primary key default gen_random_uuid(),
  customer_id text not null,
  receipt_id text not null references live_receipts (receipt_id) on delete restrict,
  added_at timestamptz not null default now(),
  hidden boolean not null default false,
  unique (customer_id, receipt_id)
);
create index if not exists live_wallet_customer_idx
  on live_wallet (customer_id, added_at desc);

-- ---------- audit trail: refunds/corrections as separate events ----------
create table if not exists live_audit (
  id uuid primary key default gen_random_uuid(),
  receipt_id text not null references live_receipts (receipt_id) on delete cascade,
  type text not null,
  detail text not null,
  amount_minor integer,
  actor text not null,
  created_at timestamptz not null default now()
);
create index if not exists live_audit_receipt_idx
  on live_audit (receipt_id, created_at);

-- ---------- verification activity log ----------
create table if not exists live_verify_log (
  id uuid primary key default gen_random_uuid(),
  receipt_id text not null,
  result text not null,
  source text not null,
  created_at timestamptz not null default now()
);
create index if not exists live_verify_log_created_idx
  on live_verify_log (created_at desc);

-- ---------- row-level security (DEMO-OPEN — see production notes) ----------
alter table live_receipts enable row level security;
alter table live_wallet enable row level security;
alter table live_audit enable row level security;
alter table live_verify_log enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'demo open access' and tablename = 'live_receipts') then
    create policy "demo open access" on live_receipts for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'demo open access' and tablename = 'live_wallet') then
    create policy "demo open access" on live_wallet for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'demo open access' and tablename = 'live_audit') then
    create policy "demo open access" on live_audit for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'demo open access' and tablename = 'live_verify_log') then
    create policy "demo open access" on live_verify_log for all using (true) with check (true);
  end if;
end $$;
