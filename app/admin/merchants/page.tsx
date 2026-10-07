import type { Metadata } from "next";
import MerchantsView from "@/components/admin/MerchantsView";

export const metadata: Metadata = {
  title: "Admin Merchants",
  description: "Merchants on Receipti — receipts, revenue, tax reported, and status.",
};

export default function AdminMerchantsPage() {
  return <MerchantsView />;
}
