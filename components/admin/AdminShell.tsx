"use client";

import * as React from "react";
import { Activity, Bell, Landmark, LayoutDashboard, ReceiptText, Store } from "lucide-react";
import { PortalShell } from "@/components/layout/PortalShell";
import { unreadNotifyCount } from "@/lib/notify";

/** Admin portal frame. Client-side so icon components stay out of server props. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const [unread, setUnread] = React.useState(0);

  React.useEffect(() => {
    const sync = () => setUnread(unreadNotifyCount());
    sync();
    window.addEventListener("receipti:notify", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("receipti:notify", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <PortalShell
      eyebrow="Receipti"
      title="Admin"
      nav={[
        { href: "/admin", label: "Overview", icon: LayoutDashboard },
        { href: "/admin/notifications", label: "Notifications", icon: Bell, badge: unread },
        { href: "/admin/merchants", label: "Merchants", icon: Store },
        { href: "/admin/receipts", label: "Receipts", icon: ReceiptText },
        { href: "/admin/taxes", label: "Taxes", icon: Landmark },
        { href: "/admin/activity", label: "Activity", icon: Activity },
      ]}
    >
      {children}
    </PortalShell>
  );
}
