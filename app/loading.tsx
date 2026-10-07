import { LoadingState } from "@/components/ui";

/** Global route-transition fallback. */
export default function Loading() {
  return (
    <div className="container-x section-y">
      <LoadingState label="Loading…" />
    </div>
  );
}
