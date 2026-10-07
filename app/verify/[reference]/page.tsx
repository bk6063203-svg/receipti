import * as React from "react";
import type { Metadata } from "next";
import { VerifyResultView } from "@/components/verify";
import { LoadingState } from "@/components/ui";

export const metadata: Metadata = {
  title: "Verification result",
  description: "Receipti verification result for a receipt reference.",
};

export default async function VerifyReferencePage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  return (
    <React.Suspense
      fallback={
        <div className="container-x max-w-5xl py-10">
          <LoadingState label="Preparing verification…" />
        </div>
      }
    >
      <VerifyResultView reference={decodeURIComponent(reference)} />
    </React.Suspense>
  );
}
