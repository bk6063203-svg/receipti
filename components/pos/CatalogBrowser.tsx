"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { SearchX } from "lucide-react";
import type { Product, ProductCategory } from "@/types/pos";
import { POS_CATEGORIES, POS_PRODUCTS } from "@/data/pos-catalog";
import { EmptyState, SearchInput, Tabs } from "@/components/ui";
import { ProductCard } from "./ProductCard";

export function CatalogBrowser({ onAdd }: { onAdd: (p: Product) => void }) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<"All" | ProductCategory>("All");

  const counts = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const p of POS_PRODUCTS) map.set(p.category, (map.get(p.category) ?? 0) + 1);
    return map;
  }, []);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return POS_PRODUCTS.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  return (
    <section aria-label="Product catalog" className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-3">
        <SearchInput
          label="Search products"
          placeholder="Search jacket, shoes, cap…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery("")}
        />
        <Tabs
          ariaLabel="Product categories"
          value={category}
          onChange={(id) => setCategory(id as "All" | ProductCategory)}
          tabs={POS_CATEGORIES.map((c) => ({
            id: c,
            label: c,
            count: c === "All" ? POS_PRODUCTS.length : counts.get(c) ?? 0,
          }))}
        />
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={<SearchX className="h-6 w-6" aria-hidden="true" />}
          title="No products found"
          description={`Nothing matches “${query.trim()}”. Try another search or category.`}
        />
      ) : (
        <div
          role="list"
          aria-label={`${results.length} products`}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {results.map((p) => (
              <div key={p.id} role="listitem">
                <ProductCard product={p} onAdd={onAdd} />
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
