"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import type { TamperKind, VerificationResultData } from "@/types/verification";
import { verifyReference } from "@/lib/verify";
import { Breadcrumb } from "@/components/ui";
import { DemoControls } from "./DemoControls";
import { VerificationResult } from "./VerificationResult";
import { VerifySequence } from "./VerifySequence";

const STEP_MS = 520;

function parseTamper(param: string | null): TamperKind | undefined {
  if (param === "total" || param === "date" || param === "merchant" || param === "items") return param;
  return undefined;
}

export function VerifyResultView({ reference }: { reference: string }) {
  const searchParams = useSearchParams();
  const tamper = parseTamper(searchParams.get("tamper"));
  const forceUnavailable = searchParams.get("demo") === "unavailable";

  const [step, setStep] = React.useState(0);
  const [result, setResult] = React.useState<VerificationResultData | null>(null);
  const [runId, setRunId] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    setResult(null);
    setStep(0);

    // Staged progress: quick, honest, skippable by completion.
    const timers: number[] = [];
    for (let i = 1; i <= 3; i++) {
      timers.push(window.setTimeout(() => !cancelled && setStep(i), i * STEP_MS));
    }
    const minTime = new Promise((r) => setTimeout(r, 3 * STEP_MS + 250));

    (async () => {
      const [res] = await Promise.all([verifyReference(reference, { tamper, forceUnavailable }), minTime]);
      if (cancelled) return;
      setStep(3);
      window.setTimeout(() => !cancelled && setResult(res), 220);
    })();

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [reference, tamper, forceUnavailable, runId]);

  return (
    <div className="container-x flex max-w-5xl flex-col gap-6 py-6 sm:py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Verify", href: "/verify" },
          { label: reference },
        ]}
      />
      {!result ? (
        <VerifySequence activeIndex={step} />
      ) : (
        <>
          <VerificationResult result={result} onRetry={() => setRunId((n) => n + 1)} />
          <DemoControls />
        </>
      )}
    </div>
  );
}
