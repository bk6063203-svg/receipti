"use client";

import { LoadingState } from "@/components/ui";
import { FadeIn, useMerchant } from "@/components/merchant";
import {
  ApiSetupCard,
  ConnectionCard,
  DocsPreview,
  EndpointPreview,
  ErrorsSection,
  HealthCard,
  IdempotencyDemo,
  IntegrationFlow,
  IntegrationHeading,
  IntegrationTabs,
  MappingTable,
  MediaMapping,
  MethodsGrid,
  NoPosCard,
  PermissionsCard,
  PosBoundary,
  SecurityGrid,
  SyncCard,
} from "@/components/integration";

export default function MerchantIntegrationPage() {
  const { merchant, receipts, loading } = useMerchant();
  const latest = receipts[0];

  if (loading) {
    return <LoadingState variant="skeleton" lines={8} label="Loading integration…" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <FadeIn className="flex flex-col gap-4">
        <IntegrationHeading merchant={merchant} />
        <IntegrationTabs />
      </FadeIn>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FadeIn delay={0.05}>
          <ConnectionCard merchant={merchant} receipts={receipts} />
        </FadeIn>
        <FadeIn delay={0.07}>
          <HealthCard receipts={receipts} />
        </FadeIn>
      </div>

      <FadeIn delay={0.09}>
        <MethodsGrid />
      </FadeIn>

      <FadeIn delay={0.11}>
        <IntegrationFlow />
      </FadeIn>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FadeIn delay={0.13}>
          <ApiSetupCard receipt={latest} />
        </FadeIn>
        <FadeIn delay={0.15}>
          <EndpointPreview receipt={latest} />
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FadeIn delay={0.17}>
          <MappingTable />
        </FadeIn>
        <FadeIn delay={0.19}>
          <MediaMapping />
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FadeIn delay={0.21}>
          <SyncCard receipts={receipts} />
        </FadeIn>
        <FadeIn delay={0.23}>
          <IdempotencyDemo receipt={latest} />
        </FadeIn>
      </div>

      <FadeIn delay={0.25}>
        <ErrorsSection receipt={latest} />
      </FadeIn>

      <FadeIn delay={0.27}>
        <PermissionsCard />
      </FadeIn>

      <FadeIn delay={0.29}>
        <SecurityGrid />
      </FadeIn>

      <FadeIn delay={0.31}>
        <DocsPreview />
      </FadeIn>

      <FadeIn delay={0.33}>
        <PosBoundary />
      </FadeIn>

      <FadeIn delay={0.35}>
        <NoPosCard />
      </FadeIn>
    </div>
  );
}
