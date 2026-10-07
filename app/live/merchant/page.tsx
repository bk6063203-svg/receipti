import type { Metadata } from "next";
import Link from "next/link";
import { LayoutGrid, ReceiptText, Smartphone } from "lucide-react";
import { Breadcrumb, Button } from "@/components/ui";
import { LiveProvider } from "@/components/live/LiveProvider";
import { MerchantPos } from "@/components/live/MerchantPos";

export const metadata: Metadata = {
  title: "Merchant till · Live Demo",
  description:
    "Live demo cashier screen: search, barcode scan, quantities, discounts, and charging on a shared transaction.",
};

export default function LiveMerchantPage() {
  return (
    <div className="container-x flex flex-col gap-5 py-8 lg:py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Live Demo", href: "/live" },
          { label: "Merchant View" },
        ]}
      />
      <LiveProvider>
        <MerchantPos />
      </LiveProvider>
      <div className="flex flex-wrap gap-2">
        <Link href="/live/customer" target="_blank" rel="noreferrer">
          <Button variant="outline" size="sm" leftIcon={<Smartphone className="h-4 w-4" aria-hidden="true" />}>
            Open customer display in a new tab
          </Button>
        </Link>
        <Link href="/live/split">
          <Button variant="outline" size="sm" leftIcon={<LayoutGrid className="h-4 w-4" aria-hidden="true" />}>
            Open split screen
          </Button>
        </Link>
        <Link href="/live/history">
          <Button variant="outline" size="sm" leftIcon={<ReceiptText className="h-4 w-4" aria-hidden="true" />}>
            Receipt history
          </Button>
        </Link>
      </div>
    </div>
  );
}
