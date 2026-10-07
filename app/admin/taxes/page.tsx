import type { Metadata } from "next";
import TaxesView from "@/components/admin/TaxesView";

export const metadata: Metadata = {
  title: "Admin Taxes",
  description: "Tax reported on receipt records, per merchant.",
};

export default function AdminTaxesPage() {
  return <TaxesView />;
}
