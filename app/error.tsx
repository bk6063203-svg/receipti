"use client";

import { ErrorState } from "@/components/ui";

/** Global route error boundary. */
export default function Error({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-x section-y">
      <ErrorState onRetry={reset} />
    </div>
  );
}
