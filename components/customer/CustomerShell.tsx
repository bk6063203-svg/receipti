"use client";

import * as React from "react";
import { LayoutDashboard, ReceiptText, TriangleAlert, Undo2, Wallet } from "lucide-react";
import { PortalShell } from "@/components/layout/PortalShell";
import { allReceipts } from "@/lib/admin";
import { allCustomerAlerts } from "@/lib/customer";
import { listStoredReceipts } from "@/lib/pos-store";

/** Customer portal frame — computes the live alert count for the nav badge. */
export function CustomerShell({ children }: { children: React.ReactNode }) {
  const [alertCount, setAlertCount] = React.useState(0);

  React.useEffect(() => {
    const rows = allReceipts(listStoredReceipts());
    setAlertCount(allCustomerAlerts(rows.map((r) => r.receipt)).length);
  }, []);

  return (
    <PortalShell
      eyebrow="Receipti"
      title="Customer"
      nav={[
        { href: "/customer", label: "Overview", icon: LayoutDashboard },
        { href: "/customer/receipts", label: "Receipts", icon: ReceiptText },
        { href: "/customer/wallet", label: "Wallet", icon: Wallet },
        { href: "/customer/alerts", label: "Alerts", icon: TriangleAlert, badge: alertCount },
        { href: "/customer/refunds", label: "Refunds", icon: Undo2 },
      ]}
    >
      {children}
    </PortalShell>
  );
}
