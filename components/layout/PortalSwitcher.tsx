"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeftRight, LayoutDashboard, Store, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";

export const PORTAL_LINKS = [
  { id: "customer", label: "Customer Portal", href: "/customer", icon: User },
  { id: "merchant", label: "Merchant Portal", href: "/merchant", icon: Store },
  { id: "admin", label: "Admin", href: "/admin", icon: LayoutDashboard },
] as const;

/** Prototype-only portal jumping — no authentication, just navigation. */
export function PortalSwitcher({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const current = PORTAL_LINKS.find((p) => pathname === p.href || pathname.startsWith(`${p.href}/`));

  return (
    <Dropdown
      key={pathname}
      label="Switch portal"
      align="right"
      selectedId={current?.id}
      trigger={
        <Button variant="outline" size={compact ? "sm" : "md"} leftIcon={<ArrowLeftRight className="h-4 w-4" aria-hidden="true" />}>
          Switch Portal
        </Button>
      }
      items={PORTAL_LINKS.map((p) => ({
        id: p.id,
        label: p.label,
        icon: <p.icon className="h-4 w-4" aria-hidden="true" />,
      }))}
      onSelect={(id) => {
        const target = PORTAL_LINKS.find((p) => p.id === id);
        if (target) router.push(target.href);
      }}
    />
  );
}
