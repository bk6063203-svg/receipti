import type { Metadata } from "next";
import Link from "next/link";
import { LayoutGrid, Store, Wallet } from "lucide-react";
import { Breadcrumb, Button } from "@/components/ui";
import { LiveProvider } from "@/components/live/LiveProvider";
import { CustomerDisplay } from "@/components/live/CustomerDisplay";

export const metadata: Metadata = {
  title: "Customer display · Live Demo",
  description:
    "Live demo customer screen: scanned items, running subtotal, GST, and payable amount updating in real time.",
};

export default function LiveCustomerPage() {
  return (
    <div className="container-x flex flex-col gap-5 py-8 lg:py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Live Demo", href: "/live" },
          { label: "Customer View" },
        ]}
      />
      <div className="mx-auto w-full max-w-3xl">
        <LiveProvider>
          <CustomerDisplay />
        </LiveProvider>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Link href="/live/merchant" target="_blank" rel="noreferrer">
          <Button variant="outline" size="sm" leftIcon={<Store className="h-4 w-4" aria-hidden="true" />}>
            Open merchant till in a new tab
          </Button>
        </Link>
        <Link href="/live/split">
          <Button variant="outline" size="sm" leftIcon={<LayoutGrid className="h-4 w-4" aria-hidden="true" />}>
            Open split screen
          </Button>
        </Link>
        <Link href="/live/wallet">
          <Button variant="outline" size="sm" leftIcon={<Wallet className="h-4 w-4" aria-hidden="true" />}>
            Open wallet
          </Button>
        </Link>
      </div>
    </div>
  );
}
