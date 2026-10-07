import type { Metadata } from "next";
import AdminOverview from "@/components/admin/AdminOverview";

export const metadata: Metadata = {
  title: "System overview",
  description: "Prototype-only internal view of the Receipti demo — merchants, receipts, and activity.",
};

export default function AdminPage() {
  return <AdminOverview />;
}
