import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui";
import { LiveReceiptView } from "@/components/live/LiveReceiptView";

export const metadata: Metadata = {
  title: "Live receipt",
  description:
    "Finalized Live Demo receipt, resolved by claim token — the same receipt the customer claims by QR, NFC tap, or wallet.",
};

export default async function LiveReceiptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <div className="container-x flex flex-col gap-5 py-8 lg:py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Live Demo", href: "/live" },
          { label: "Receipt" },
        ]}
      />
      <LiveReceiptView token={token} />
    </div>
  );
}
