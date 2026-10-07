import type { Metadata } from "next";
import { DashboardShell, MerchantProvider } from "@/components/merchant";

export const metadata: Metadata = {
  title: "Merchant Dashboard",
  description: "Receipti merchant demo — receipts, transactions, refunds, and verification activity.",
};

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return (
    <MerchantProvider>
      <DashboardShell>{children}</DashboardShell>
    </MerchantProvider>
  );
}
