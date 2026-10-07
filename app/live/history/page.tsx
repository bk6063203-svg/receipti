import type { Metadata } from "next";
import Link from "next/link";
import { ScanSearch, Store } from "lucide-react";
import { Breadcrumb, Button } from "@/components/ui";
import { HistoryView } from "@/components/live/HistoryView";

export const metadata: Metadata = {
  title: "Receipt history · Live Demo",
  description:
    "Merchant receipt history: this account's finalized receipts, audit trail, refunds, and voids.",
};

export default function LiveHistoryPage() {
  return (
    <div className="container-x flex max-w-4xl flex-col gap-5 py-8 lg:py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Live Demo", href: "/live" },
          { label: "Receipt history" },
        ]}
      />
      <HistoryView />
      <div className="flex flex-wrap gap-2">
        <Link href="/live/merchant">
          <Button variant="outline" size="sm" leftIcon={<Store className="h-4 w-4" aria-hidden="true" />}>
            Back to the till
          </Button>
        </Link>
        <Link href="/live/verify">
          <Button variant="outline" size="sm" leftIcon={<ScanSearch className="h-4 w-4" aria-hidden="true" />}>
            Verify a receipt
          </Button>
        </Link>
      </div>
    </div>
  );
}
