import type { Metadata } from "next";
import Link from "next/link";
import { ReceiptText, ScanSearch } from "lucide-react";
import { Breadcrumb, Button } from "@/components/ui";
import { LiveProvider } from "@/components/live/LiveProvider";
import { WalletView } from "@/components/live/WalletView";

export const metadata: Metadata = {
  title: "Wallet · Live Demo",
  description:
    "Customer receipt wallet: claimed live receipts with full details. Removing one hides it — the original stays in Receipti's records.",
};

export default function LiveWalletPage() {
  return (
    <div className="container-x flex max-w-4xl flex-col gap-5 py-8 lg:py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Live Demo", href: "/live" },
          { label: "Wallet" },
        ]}
      />
      <LiveProvider>
        <WalletView />
      </LiveProvider>
      <div className="flex flex-wrap gap-2">
        <Link href="/live/verify">
          <Button variant="outline" size="sm" leftIcon={<ScanSearch className="h-4 w-4" aria-hidden="true" />}>
            Verify a receipt
          </Button>
        </Link>
        <Link href="/live/history">
          <Button variant="outline" size="sm" leftIcon={<ReceiptText className="h-4 w-4" aria-hidden="true" />}>
            Merchant history
          </Button>
        </Link>
      </div>
    </div>
  );
}
