import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui";
import { VerifyView } from "@/components/live/VerifyView";

export const metadata: Metadata = {
  title: "Verify Receipt · Live Demo",
  description:
    "Verify a live receipt by ID or QR claim link against Receipti's records — with integrity check and activity log.",
};

export default function LiveVerifyPage() {
  return (
    <div className="container-x flex max-w-4xl flex-col gap-5 py-8 lg:py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Live Demo", href: "/live" },
          { label: "Verify Receipt" },
        ]}
      />
      <VerifyView />
    </div>
  );
}
