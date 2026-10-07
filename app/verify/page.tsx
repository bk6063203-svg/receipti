import type { Metadata } from "next";
import { VerifyLanding } from "@/components/verify";

export const metadata: Metadata = {
  title: "Verify",
  description: "Check whether a receipt matches its trusted Receipti transaction record.",
};

export default function VerifyPage() {
  return <VerifyLanding />;
}
