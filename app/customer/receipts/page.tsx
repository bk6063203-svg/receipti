import type { Metadata } from "next";
import ReceiptsView from "@/components/customer/ReceiptsView";

export const metadata: Metadata = {
  title: "My Receipts",
  description: "Every customer receipt — search, filter, and save to wallet.",
};

export default function CustomerReceiptsPage() {
  return <ReceiptsView />;
}
