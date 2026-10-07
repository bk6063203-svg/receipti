import type { Metadata } from "next";
import { PosApp } from "@/components/pos";
import { Breadcrumb } from "@/components/ui";

export const metadata: Metadata = {
  title: "Merchant POS demo",
  description:
    "Simulated merchant POS: build a sale, complete payment, and generate a Receipti digital receipt with QR handoff.",
};

export default function MerchantPosPage() {
  return (
    <div className="container-x flex flex-col gap-5 py-8 lg:py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Demo", href: "/demo" },
          { label: "Merchant POS" },
        ]}
        className="pos-no-print"
      />
      <PosApp />
    </div>
  );
}
