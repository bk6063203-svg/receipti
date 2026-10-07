import type { Metadata } from "next";
import { AdminDemoExperience } from "@/components/demo/AdminDemoExperience";
import { Breadcrumb } from "@/components/ui";

export const metadata: Metadata = {
  title: "Admin notifications demo",
  description:
    "Admin demo: a live event feed — run a sale, refund, or fuel check in another tab and watch the notification land instantly.",
};

export default function AdminDemoPage() {
  return (
    <div className="container-x flex flex-col gap-5 py-8 lg:py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Demo", href: "/demo" },
          { label: "Admin notifications" },
        ]}
      />
      <AdminDemoExperience />
    </div>
  );
}
