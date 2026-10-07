import type { Metadata } from "next";
import ActivityView from "@/components/admin/ActivityView";

export const metadata: Metadata = {
  title: "Admin Activity",
  description: "Platform activity — receipts, refunds, verification, and integrations.",
};

export default function AdminActivityPage() {
  return <ActivityView />;
}
