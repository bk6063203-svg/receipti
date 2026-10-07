"use client";

import * as React from "react";
import { merchantById } from "@/data/merchant-demo";
import { listStoredReceipts } from "@/lib/pos-store";
import { getActiveMerchantId, setActiveMerchantId } from "@/lib/merchant-store";
import { eventsForMerchant, receiptsForMerchant } from "@/lib/merchant";
import type { Merchant, VerificationEvent } from "@/types/merchant";
import type { PosReceipt } from "@/types/pos";

interface MerchantContextValue {
  merchant: Merchant;
  merchantId: string;
  switchMerchant: (id: string) => void;
  receipts: PosReceipt[];
  events: VerificationEvent[];
  refresh: () => void;
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const MerchantContext = React.createContext<MerchantContextValue | null>(null);

export function MerchantProvider({ children }: { children: React.ReactNode }) {
  const [merchantId, setMerchantId] = React.useState("urban-threads");
  const [receipts, setReceipts] = React.useState<PosReceipt[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    setMerchantId(getActiveMerchantId());
  }, []);

  React.useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => {
      setReceipts(receiptsForMerchant(merchantId, listStoredReceipts()));
      setLoading(false);
    }, 400);
    return () => window.clearTimeout(t);
  }, [merchantId]);

  const refresh = React.useCallback(() => {
    setReceipts(receiptsForMerchant(merchantId, listStoredReceipts()));
  }, [merchantId]);

  const switchMerchant = React.useCallback((id: string) => {
    setActiveMerchantId(id);
    setMerchantId(id);
  }, []);

  const value = React.useMemo<MerchantContextValue>(
    () => ({
      merchant: merchantById(merchantId),
      merchantId,
      switchMerchant,
      receipts,
      refresh,
      events: eventsForMerchant(merchantId),
      loading,
      searchQuery,
      setSearchQuery,
    }),
    [merchantId, switchMerchant, receipts, refresh, loading, searchQuery]
  );

  return <MerchantContext.Provider value={value}>{children}</MerchantContext.Provider>;
}

export function useMerchant(): MerchantContextValue {
  const ctx = React.useContext(MerchantContext);
  if (!ctx) throw new Error("useMerchant must be used inside <MerchantProvider>");
  return ctx;
}
