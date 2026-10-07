"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { PortalSwitcher } from "./PortalSwitcher";
import { cn } from "@/lib/utils";

export interface PortalNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface PortalShellProps {
  eyebrow: string;
  title: string;
  nav: PortalNavItem[];
  children: React.ReactNode;
}

/**
 * Generic portal frame: sidebar on desktop, scrollable nav bar on mobile.
 * Shared by the customer and admin portals (merchant keeps its dashboard shell).
 */
export function PortalShell({ eyebrow, title, nav, children }: PortalShellProps) {
  const pathname = usePathname();
  return (
    <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <a
        href="#portal-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[var(--r-card)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium"
      >
        Skip to portal content
      </a>

      {/* Desktop sidebar */}
      <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] shrink-0 flex-col border-r border-line bg-[var(--r-card)] lg:flex lg:top-[4.5rem] lg:h-[calc(100dvh-4.5rem)]">
        <div className="px-5 pb-4 pt-6">
          <p className="type-label text-[var(--r-primary)]">{eyebrow}</p>
          <p className="type-h4 mt-0.5">{title}</p>
        </div>
        <nav aria-label={`${title} navigation`} className="flex-1 overflow-y-auto px-3">
          <ul className="flex flex-col gap-1">
            {nav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-[var(--r-primary-muted)] text-[var(--r-primary)]"
                        : "text-ink-muted hover:bg-background hover:text-ink"
                    )}
                  >
                    <Icon className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden="true" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        aria-label={`${item.badge} new`}
                        className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--r-primary)] px-1.5 text-[0.6875rem] font-bold text-white tnum"
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="shrink-0 border-t border-line p-4">
          <PortalSwitcher compact />
        </div>
      </aside>

      {/* Mobile / tablet nav bar */}
      <div className="sticky top-16 z-30 border-b border-line bg-background/95 backdrop-blur-sm lg:hidden">
        <nav aria-label={`${title} navigation`} className="container-x flex gap-2 overflow-x-auto py-2.5">
          {nav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                  active
                    ? "border-[var(--r-primary)] bg-[var(--r-primary)] text-white"
                    : "border-line bg-[var(--r-card)] text-ink-muted"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    aria-label={`${item.badge} new`}
                    className={cn(
                      "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.6875rem] font-bold tnum",
                      active ? "bg-white text-[var(--r-primary)]" : "bg-[var(--r-primary)] text-white"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <main id="portal-main" className="min-w-0">
        {children}
      </main>
    </div>
  );
}
