/* ============================================================
   RECEIPTI — Receipt media + product detail resolution
   Attaches merchant-provided product imagery and variant detail
   to receipt lines by SKU. Lines without a catalog match keep
   empty fields and render placeholders — never random imagery.
   Phase 04: media · Phase 08: variant/size/color/category.
   ============================================================ */
import { POS_PRODUCTS } from "@/data/pos-catalog";
import type { PosReceipt, PosReceiptLine } from "@/types/pos";

const bySku = new Map(POS_PRODUCTS.map((p) => [p.sku, p]));

export function mediaForLine(line: Pick<PosReceiptLine, "sku">): PosReceiptLine["media"] {
  if (line.sku === "") return [];
  const product = bySku.get(line.sku);
  if (!product) return [];
  return [{ id: `${product.id}-img`, url: product.image, type: "image", alt: product.imageAlt }];
}

export function detailForLine(
  line: Pick<PosReceiptLine, "sku">
): Pick<PosReceiptLine, "variant" | "size" | "color" | "category"> {
  const product = bySku.get(line.sku);
  if (!product) return {};
  const color = product.details?.color;
  const size = product.details?.size;
  return {
    variant: color && size ? `${color} / ${size}` : (color ?? size ?? undefined),
    size,
    color,
    category: product.category,
  };
}

/** Return a copy of the receipt with every line's media + detail resolved. */
export function withResolvedMedia(receipt: PosReceipt): PosReceipt {
  return {
    ...receipt,
    lines: receipt.lines.map((l) => {
      const d = detailForLine(l);
      return {
        ...l,
        variant: l.variant ?? d.variant,
        size: l.size ?? d.size,
        color: l.color ?? d.color,
        category: l.category ?? d.category,
        media: l.media ?? mediaForLine(l),
      };
    }),
  };
}
