"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { IconButton } from "@/components/ui";
import { SidebarNav } from "./Sidebar";
import { Topbar } from "./Topbar";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [drawer, setDrawer] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => setDrawer(false), [pathname]);

  React.useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawer(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawer]);

  return (
    <div className="flex min-h-screen bg-background text-ink">
      <a
        href="#merchant-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-[var(--r-card)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-pop"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 border-r border-line bg-[var(--r-card)] transition-[width] duration-200 motion-reduce:transition-none lg:block",
          collapsed ? "w-[4.75rem]" : "w-60"
        )}
      >
        <SidebarNav collapsed={collapsed} />
        <span className="absolute bottom-4 right-3 hidden lg:block">
          <IconButton
            label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            size="sm"
            variant="outline"
            onClick={() => setCollapsed((v) => !v)}
            className={cn("bg-[var(--r-card)]", collapsed && "right-0")}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
            )}
          </IconButton>
        </span>
      </aside>

      {/* Mobile / tablet drawer */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", drawer ? "visible" : "invisible")} aria-hidden={!drawer}>
        <div
          onClick={() => setDrawer(false)}
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity duration-200 motion-reduce:transition-none",
            drawer ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Merchant navigation"
          className={cn(
            "absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-[var(--r-card)] shadow-pop transition-transform duration-200 motion-reduce:transition-none",
            drawer ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <SidebarNav onNavigate={() => setDrawer(false)} />
          <span className="absolute right-3 top-4">
            <IconButton label="Close navigation menu" size="sm" onClick={() => setDrawer(false)}>
              <X className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setDrawer(true)} />
        <main id="merchant-main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
          {children}
        </main>
        <footer className="mx-auto w-full max-w-6xl px-4 pb-6 sm:px-6">
          <p className="type-caption border-t border-line pt-4 text-center text-ink-faint">
            Receipti merchant demo — figures come from the prototype dataset, not a live
            integration. Receipti is the digital receipt layer; the merchant POS stays the
            system of record.
          </p>
        </footer>
      </div>
    </div>
  );
}
