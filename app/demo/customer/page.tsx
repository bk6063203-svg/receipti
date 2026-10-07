import type { Metadata } from "next";
import { ShopExperience } from "@/components/demo/ShopExperience";
import { Breadcrumb } from "@/components/ui";

export const metadata: Metadata = {
  title: "Shop & pay demo",
  description:
    "Customer demo: browse the store, check out, and pay — the receipt lands in the wallet, the merchant portal, and admin notifications.",
};

export default function CustomerDemoPage() {
  return (
    <div className="container-x flex flex-col gap-5 py-8 lg:py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Demo", href: "/demo" },
          { label: "Shop & pay" },
        ]}
      />
      <ShopExperience />
    </div>
  );
}
