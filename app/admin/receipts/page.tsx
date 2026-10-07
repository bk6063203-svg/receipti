import type { Metadata } from "next";
import AdminReceiptsView from "@/components/admin/AdminReceiptsView";

export const metadata: Metadata = {
  title: "Admin Receipts",
  description: "Every trusted receipt record — search, filter, and inspect.",
};

export default function AdminReceiptsPage() {
  return <AdminReceiptsView />;
}
