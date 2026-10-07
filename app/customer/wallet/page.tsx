import type { Metadata } from "next";
import WalletView from "@/components/customer/WalletView";

export const metadata: Metadata = {
  title: "Receipt Wallet",
  description: "Saved customer receipts — for returns and records.",
};

export default function WalletPage() {
  return <WalletView />;
}
