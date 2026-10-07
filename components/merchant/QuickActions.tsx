"use client";

import Link from "next/link";
import { PlusCircle, Plug, Receipt, ScanSearch, Undo2 } from "lucide-react";
import { Button, Card } from "@/components/ui";

const ACTIONS = [
  { href: "/demo/merchant-pos", label: "Issue demo receipt", icon: PlusCircle },
  { href: "/merchant/receipts", label: "View receipts", icon: Receipt },
  { href: "/merchant/refunds", label: "View refunds", icon: Undo2 },
  { href: "/verify", label: "Verify receipt", icon: ScanSearch },
  { href: "/merchant/integration", label: "Integration", icon: Plug },
];

export function QuickActions() {
  return (
    <Card as="section" aria-label="Quick actions">
      <h2 className="type-label text-ink-faint">Quick actions</h2>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <li key={a.href + a.label}>
              <Link href={a.href}>
                <Button variant="outline" className="h-full w-full" leftIcon={<Icon className="h-4 w-4" aria-hidden="true" />}>
                  {a.label}
                </Button>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
