import type { Metadata } from "next";
import { DesignSystemDemo } from "@/components/dev/DesignSystemDemo";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Design system",
  description: "Receipti Phase 01 design system reference.",
};

export default function DesignSystemPage() {
  return (
    <div className="container-x section-y flex flex-col gap-10">
      <PageHeader
        title="Design system"
        description="Phase 01 reference — every token and reusable component future pages are built from. Internal preview, not a product page."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Design system" }]}
      />
      <DesignSystemDemo />
    </div>
  );
}
