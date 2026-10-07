import type { Metadata } from "next";
import { ReceiptPage } from "@/components/receipt";

export const metadata: Metadata = {
  title: "Digital receipt",
  description: "View your Receipti digital receipt — items, totals, status, and verification.",
};

export default async function ReceiptRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="container-x py-6 sm:py-10">
      <ReceiptPage reference={decodeURIComponent(id)} />
    </div>
  );
}
