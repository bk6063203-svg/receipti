import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui";
import { LiveProvider } from "@/components/live/LiveProvider";
import { ExperienceView } from "@/components/live/ExperienceView";

export const metadata: Metadata = {
  title: "Experience a Real Transaction · Live Demo",
  description:
    "Guided investor demonstration: scan on the merchant till, watch the customer display, confirm payment, deliver the receipt, then verify it — every step live.",
};

export default function LiveExperiencePage() {
  return (
    <div className="container-x flex max-w-7xl flex-col gap-5 py-8 lg:py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Live Demo", href: "/live" },
          { label: "Experience" },
        ]}
      />
      <LiveProvider>
        <ExperienceView />
      </LiveProvider>
    </div>
  );
}
