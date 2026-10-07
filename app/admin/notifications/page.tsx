import type { Metadata } from "next";
import { NotificationsView } from "@/components/admin/NotificationsView";

export const metadata: Metadata = {
  title: "Admin notifications",
  description:
    "Admin notification center: every sale, refund request, approval, and fuel discrepancy the moment it happens.",
};

export default function AdminNotificationsPage() {
  return <NotificationsView />;
}
