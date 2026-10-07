"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  LayoutDashboard,
  Plug,
  Receipt,
  Settings,
  ShieldCheck,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { PortalSwitcher } from "@/components/layout/PortalSwitcher";
import { useMerchant } from "./MerchantContext";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { href: "/merchant", label: "Overview", icon: LayoutDashboard },
  { href: "/merchant/receipts", label: "Receipts", icon: Receipt },
  { href: "/merchant/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/merchant/refunds", label: "Refunds", icon: Undo2 },
  { href: "/merchant/verification", label: "Verification", icon: ShieldCheck },
  { href: "/merchant/integration", label: "Integration", icon: Plug },
  { href: "/merchant/settings", label: "Settings", icon: Settings },
];

export function SidebarNav({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { merchant } = useMerchant();
  return (
    <div className={cn("flex h-full flex-col", collapsed ? "items-center" : "")}>
      <Link
        href="/merchant"
        onClick={onNavigate}
        aria-label="Receipti merchant dashboard"
        className="flex h-16 shrink-0 items-center gap-2.5 border-b border-line px-4"
      >
        <Logo compact />
        {!collapsed && (
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold">Merchant</span>
            <span className="type-caption block truncate text-ink-faint">Demo workspace</span>
          </span>
        )}
      </Link>

      <nav aria-label="Merchant" className="flex-1 overflow-y-auto p-3">
        <ul className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    collapsed && "justify-center px-0",
                    active
                      ? "bg-[var(--r-primary-muted)] text-[var(--r-primary)]"
                      : "text-ink-muted hover:bg-background hover:text-ink"
                  )}
                >
                  <Icon className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden="true" />
                  {!collapsed && item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={cn("shrink-0 border-t border-line p-4", collapsed && "px-2")}>
        {!collapsed ? (
          <p className="flex items-center gap-2 text-[0.8125rem] text-ink-muted">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--r-verified)]" aria-hidden="true" />
            <span className="truncate">
              {merchant.posName} · <span className="font-medium text-ink">connected</span>
            </span>
          </p>
        ) : (
          <span
            className="mx-auto block h-2 w-2 rounded-full bg-[var(--r-verified)]"
            role="img"
            aria-label={`${merchant.posName} connected (demo)`}
          />
        )}
        {!collapsed && <p className="type-caption mt-1 text-ink-faint">Demo connection — no live sync.</p>}
        {!collapsed && (
          <div className="mt-3 flex justify-start border-t border-line pt-3">
            <PortalSwitcher compact />
          </div>
        )}
      </div>
    </div>
  );
}
