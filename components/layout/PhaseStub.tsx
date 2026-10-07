import Link from "next/link";
import { Hammer } from "lucide-react";
import { Button, EmptyState, PageHeader, type Crumb } from "@/components/ui";

export interface PhaseStubProps {
  title: string;
  description: string;
  breadcrumb: Crumb[];
  phase?: string;
}

/**
 * Placeholder for routes reserved by the Phase 01 architecture.
 * Real pages land in later phases without touching the foundation.
 */
export function PhaseStub({ title, description, breadcrumb, phase = "a later phase" }: PhaseStubProps) {
  return (
    <div className="container-x section-y flex flex-col gap-8">
      <PageHeader title={title} description={description} breadcrumb={breadcrumb} />
      <EmptyState
        icon={<Hammer className="h-6 w-6" aria-hidden="true" />}
        title={`Scheduled for ${phase}`}
        description="This route is reserved in the Receipti architecture. Its page will be built on the Phase 01 design system."
        action={
          <Link href="/design-system">
            <Button variant="outline">View design system</Button>
          </Link>
        }
      />
    </div>
  );
}
