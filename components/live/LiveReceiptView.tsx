"use client";

import * as React from "react";
import Link from "next/link";
import { ReceiptText } from "lucide-react";
import type { ReceiptRecord } from "@/lib/live-receipt-record";
import { getRepository } from "@/lib/receipt-repo";
import { Button, Card, EmptyState } from "@/components/ui";
import { LiveReceiptCard } from "./LiveReceiptCard";

/** Finalized receipt, resolved by opaque claim token through the repository. */
export function LiveReceiptView({ token }: { token: string }) {
  const [record, setRecord] = React.useState<ReceiptRecord | null | undefined>(undefined);

  React.useEffect(() => {
    let live = true;
    getRepository()
      .then((repo) => repo.getReceiptByToken(token))
      .then((r) => {
        if (live) setRecord(r);
      })
      .catch(() => {
        if (live) setRecord(null);
      });
    return () => {
      live = false;
    };
  }, [token]);

  if (record === undefined) {
    return (
      <Card className="mx-auto w-full max-w-xl" aria-busy="true" aria-label="Loading receipt">
        <div className="flex animate-pulse flex-col gap-3">
          <div className="h-6 w-2/3 rounded-lg bg-background" />
          <div className="h-4 w-1/3 rounded-lg bg-background" />
          <div className="h-24 rounded-xl bg-background" />
          <div className="h-4 w-1/2 rounded-lg bg-background" />
        </div>
      </Card>
    );
  }

  if (record === null) {
    return (
      <Card className="mx-auto w-full max-w-xl">
        <EmptyState
          icon={<ReceiptText className="h-8 w-8" aria-hidden="true" />}
          title="Receipt not found"
          description="No finalized receipt matches this claim token. Receipts issued on another device only resolve here once the shared Supabase database is connected."
          action={
            <Link href="/live">
              <Button variant="outline">Back to Live Demo</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <LiveReceiptCard record={record} />
    </div>
  );
}
