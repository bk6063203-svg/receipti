import Link from "next/link";
import { Logo } from "./Logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/#product", label: "Product" },
      { href: "/#how-it-works", label: "How It Works" },
      { href: "/verify", label: "Verification" },
      { href: "/merchant/integration", label: "Integrations" },
    ],
  },
  {
    title: "Customers",
    links: [
      { href: "/customer", label: "Customer Portal" },
      { href: "/customer/wallet", label: "Receipt Wallet" },
      { href: "/customer/refunds", label: "Refunds" },
      { href: "/verify", label: "Verify a receipt" },
    ],
  },
  {
    title: "Merchants",
    links: [
      { href: "/merchant", label: "Merchant Portal" },
      { href: "/merchant/receipts", label: "Receipts" },
      { href: "/merchant/verification", label: "Verification" },
      { href: "/merchant/integration", label: "Integration" },
    ],
  },
  {
    title: "Platform",
    links: [
      { href: "/demo", label: "Demo" },
      { href: "/demo/presentation", label: "Story" },
      { href: "/admin", label: "Admin" },
      { href: "/admin", label: "System Overview" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="surface-dark mt-auto">
      <div className="container-x grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <span className="[&_span:last-child]:text-[var(--r-on-dark)]">
            <Logo />
          </span>
          <p className="type-small mt-3 max-w-xs text-[var(--r-on-dark-muted)]">
            Digital receipt infrastructure. Trusted records for merchants, customers, and
            verifiers — without the paper.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={`Footer — ${col.title}`}>
            <p className="type-label text-[var(--r-on-dark-muted)]">{col.title}</p>
            <ul className="mt-3 flex flex-col gap-2">
              {col.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    className="type-small text-[var(--r-on-dark)]/80 transition-colors hover:text-[var(--r-on-dark)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-[var(--r-dark-line)]">
        <div className="container-x flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="type-caption text-[var(--r-on-dark-muted)]">
            © 2026 Receipti. All rights reserved.
          </p>
          <p className="type-caption text-[var(--r-on-dark-muted)]">
            Receipti is receipt infrastructure — not a payment processor.
          </p>
        </div>
      </div>
    </footer>
  );
}
