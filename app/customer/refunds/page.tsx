import type { Metadata } from "next";
import RefundsView from "@/components/customer/RefundsView";

export const metadata: Metadata = {
  title: "My Refunds",
  description: "Returns and corrections tracked against your receipts.",
};

export default function CustomerRefundsPage() {
  return <RefundsView />;
}
