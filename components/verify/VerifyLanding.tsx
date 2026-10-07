"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, QrCode, ScanSearch } from "lucide-react";
import { extractReference, isPlausibleReference } from "@/lib/verify";
import { Button, Card, Input, PageHeader } from "@/components/ui";
import { DemoControls } from "./DemoControls";
import { ScanModal } from "./ScanModal";

export function VerifyLanding() {
  const router = useRouter();
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [scanOpen, setScanOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const ref = extractReference(value);
    if (ref === "") {
      setError("Enter a receipt reference to verify.");
      inputRef.current?.focus();
      return;
    }
    if (!isPlausibleReference(ref)) {
      setError("That doesn't look like a Receipti reference (e.g. RCP_8F42K9M2). You can also paste a receipt link.");
      inputRef.current?.focus();
      return;
    }
    setError(null);
    router.push(`/verify/${ref}`);
  };

  return (
    <div className="container-narrow section-y flex flex-col gap-6">
      <PageHeader
        title="Verify a Receipti Receipt"
        description="Check whether a receipt matches its trusted Receipti transaction record."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Verify" }]}
      />

      <Card as="section" aria-label="Verify by reference" padding="lg">
        <form onSubmit={submit} noValidate className="flex flex-col gap-3">
          <Input
            ref={inputRef}
            label="Receipt Reference"
            placeholder="Enter receipt reference"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            error={error ?? undefined}
            hint="Example: RCP_8F42K9M2 — or paste a receipt link from a QR scan."
            autoComplete="off"
            spellCheck={false}
            leftAddon={<Fingerprint className="h-4 w-4" aria-hidden="true" />}
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" size="lg" className="flex-1" leftIcon={<ScanSearch className="h-4 w-4" aria-hidden="true" />}>
              Verify Receipt
            </Button>
            <Button type="button" size="lg" variant="outline" className="flex-1" onClick={() => setScanOpen(true)} leftIcon={<QrCode className="h-4 w-4" aria-hidden="true" />}>
              Scan QR
            </Button>
          </div>
        </form>
      </Card>

      <Card as="section" aria-label="What verification means">
        <h2 className="text-[0.9375rem] font-semibold">What does verification check?</h2>
        <ul className="type-small mt-2.5 list-disc space-y-1.5 pl-5 text-ink-muted">
          <li>
            The reference is a <strong className="text-ink">lookup identifier</strong> — it points
            to the record; it is not itself a cryptographic signature.
          </li>
          <li>
            Receipti compares the presented details against the{" "}
            <strong className="text-ink">trusted record</strong> and reports match or mismatch.
          </li>
          <li>
            Screenshots and printouts can exist — an{" "}
            <strong className="text-ink">altered copy is detected</strong> when checked.
          </li>
          <li>
            Verification confirms <strong className="text-ink">authenticity</strong>, not payment
            state — a refunded receipt can still be fully verified.
          </li>
        </ul>
      </Card>

      <DemoControls />

      <ScanModal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onManual={() => {
          setScanOpen(false);
          window.setTimeout(() => inputRef.current?.focus(), 60);
        }}
      />
    </div>
  );
}
