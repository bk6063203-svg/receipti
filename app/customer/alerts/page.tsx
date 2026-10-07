import type { Metadata } from "next";
import AlertsView from "@/components/customer/AlertsView";

export const metadata: Metadata = {
  title: "Spending Alerts",
  description: "Receipts where the numbers don't add up — overcharges and mismatches.",
};

export default function CustomerAlertsPage() {
  return <AlertsView />;
}
