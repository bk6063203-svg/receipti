import type { Metadata } from "next";
import CustomerOverview from "@/components/customer/CustomerOverview";

export const metadata: Metadata = {
  title: "Customer Portal",
  description: "Receipti for customers: spending summary, receipts, wallet, alerts, and refunds.",
};

export default function CustomerPage() {
  return <CustomerOverview />;
}
