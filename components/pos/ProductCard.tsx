"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { Product } from "@/types/pos";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui";

export function ProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (p: Product) => void;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-[var(--r-card)] shadow-subtle transition-shadow duration-200 hover:shadow-card"
    >
      <div className="relative aspect-[4/3] bg-background">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <p className="type-caption font-medium uppercase tracking-wide text-ink-faint">
          {product.category}
        </p>
        <h3 className="text-[0.9375rem] font-semibold leading-snug">{product.name}</h3>
        <p className="type-amount text-[0.9375rem] tnum" data-numeric>
          {formatMoney(product.price)}
        </p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-2 w-full"
          onClick={() => onAdd(product)}
          leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}
          aria-label={`Add ${product.name} to cart`}
        >
          Add
        </Button>
      </div>
    </motion.article>
  );
}
