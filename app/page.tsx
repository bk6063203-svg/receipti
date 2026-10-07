import type { Metadata } from "next";
import {
  ApiInfra,
  CustomerBenefits,
  FinalCta,
  Hero,
  HowItWorks,
  Institutions,
  Merchants,
  Portals,
  Problem,
  ProductMedia,
  ReceiptPreview,
  Returns,
  Security,
  Solution,
  Transition,
  Verification,
} from "@/components/landing";

export const metadata: Metadata = {
  title: "Receipti — Digital Receipt Infrastructure",
  description:
    "Receipti connects merchant transaction systems with customers through persistent digital receipts built for returns, records, and trusted verification.",
};

export default function Home() {
  return (
    <>
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <CustomerBenefits />
      <ReceiptPreview />
      <ProductMedia />
      <Returns />
      <Verification />
      <Merchants />
      <ApiInfra />
      <Security />
      <Institutions />
      <Transition />
      <Portals />
      <FinalCta />
    </>
  );
}
