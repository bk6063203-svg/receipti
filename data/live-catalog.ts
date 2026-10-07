/* Thread & Co. — Live Transaction Demo catalog. Prices in PKR (minor units), tax-exclusive. */

export const LIVE_MERCHANT = "Thread & Co.";
export const LIVE_MERCHANT_ID = "merchant-thread-co";
export const LIVE_BRANCH = "DHA Phase 6, Lahore";
export const LIVE_CURRENCY = "PKR" as const;
/** Clearly-labelled configurable demo tax rate (percent). Not a tax filing. */
export const LIVE_TAX_PRESETS = [0, 5, 10, 17];
export const LIVE_DEFAULT_TAX_PCT = 5;

export interface LiveColour {
  name: string;
  code: string;
  swatch: string;
}

export interface LiveProduct {
  id: string;
  code: string;
  name: string;
  category: string;
  priceMinor: number;
  image: string;
  sizes: string[];
  colours: LiveColour[];
  stock: number;
}

export interface LiveVariant {
  sku: string;
  barcode: string;
}

export const LIVE_PRODUCTS: LiveProduct[] = [
  {
    id: "prod-tee",
    code: "MOT",
    name: "Men's Oversized T-Shirt",
    category: "T-Shirts",
    priceMinor: 249000,
    image: "/images/live/tee.jpg",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colours: [
      { name: "Black", code: "BLK", swatch: "#1F2937" },
      { name: "White", code: "WHT", swatch: "#F1F5F9" },
      { name: "Olive", code: "OLV", swatch: "#6B7F4E" },
    ],
    stock: 30,
  },
  {
    id: "prod-jacket",
    code: "WDJ",
    name: "Women's Denim Jacket",
    category: "Jackets",
    priceMinor: 599000,
    image: "/images/live/denim-jacket.jpg",
    sizes: ["XS", "S", "M", "L", "XL"],
    colours: [
      { name: "Blue", code: "BLU", swatch: "#3B6EA5" },
      { name: "Black", code: "BLK", swatch: "#1F2937" },
    ],
    stock: 12,
  },
  {
    id: "prod-jeans",
    code: "MSJ",
    name: "Men's Slim Fit Jeans",
    category: "Denim",
    priceMinor: 349000,
    image: "/images/live/jeans.jpg",
    sizes: ["30", "32", "34", "36"],
    colours: [
      { name: "Indigo", code: "IND", swatch: "#2E3A67" },
      { name: "Light Blue", code: "LTB", swatch: "#7FA6C9" },
      { name: "Black", code: "BLK", swatch: "#1F2937" },
    ],
    stock: 20,
  },
  {
    id: "prod-shirt",
    code: "WCS",
    name: "Women's Cotton Shirt",
    category: "Shirts",
    priceMinor: 229000,
    image: "/images/live/shirt.jpg",
    sizes: ["XS", "S", "M", "L", "XL"],
    colours: [
      { name: "White", code: "WHT", swatch: "#F1F5F9" },
      { name: "Sky", code: "SKY", swatch: "#9CC3E5" },
      { name: "Blush", code: "BLS", swatch: "#E8B4B8" },
    ],
    stock: 25,
  },
  {
    id: "prod-hoodie",
    code: "UHD",
    name: "Unisex Hoodie",
    category: "Hoodies",
    priceMinor: 449000,
    image: "/images/live/hoodie.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colours: [
      { name: "Grey", code: "GRY", swatch: "#9AA0A6" },
      { name: "Black", code: "BLK", swatch: "#1F2937" },
      { name: "Navy", code: "NVY", swatch: "#1F2A44" },
    ],
    stock: 18,
  },
  {
    id: "prod-sneakers",
    code: "MCS",
    name: "Men's Casual Sneakers",
    category: "Footwear",
    priceMinor: 699000,
    image: "/images/live/sneakers.jpg",
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    colours: [
      { name: "White", code: "WHT", swatch: "#F1F5F9" },
      { name: "Black", code: "BLK", swatch: "#1F2937" },
    ],
    stock: 15,
  },
  {
    id: "prod-tote",
    code: "WTB",
    name: "Women's Tote Bag",
    category: "Bags",
    priceMinor: 299000,
    image: "/images/live/tote.jpg",
    sizes: ["One Size"],
    colours: [
      { name: "Tan", code: "TAN", swatch: "#C8A165" },
      { name: "Black", code: "BLK", swatch: "#1F2937" },
    ],
    stock: 10,
  },
  {
    id: "prod-belt",
    code: "LBT",
    name: "Leather Belt",
    category: "Accessories",
    priceMinor: 179000,
    image: "/images/live/belt.jpg",
    sizes: ["S", "M", "L"],
    colours: [
      { name: "Brown", code: "BRN", swatch: "#7B4B2A" },
      { name: "Black", code: "BLK", swatch: "#1F2937" },
    ],
    stock: 40,
  },
];

export const LIVE_CATEGORIES: string[] = [
  "All",
  ...Array.from(new Set(LIVE_PRODUCTS.map((p) => p.category))),
];

const pad2 = (n: number): string => String(n).padStart(2, "0");

const sizeCode = (size: string): string =>
  size === "One Size" ? "OS" : size.replace(/\s+/g, "").toUpperCase();

/** Deterministic unique SKU + 13-digit barcode per size × colour variant. */
export function variantOf(product: LiveProduct, size: string, colour: string): LiveVariant {
  const pi = Math.max(0, LIVE_PRODUCTS.findIndex((p) => p.id === product.id));
  const si = Math.max(0, product.sizes.indexOf(size));
  const colourDef = product.colours.find((c) => c.name === colour) ?? product.colours[0]!;
  const ci = Math.max(0, product.colours.indexOf(colourDef));
  const serial = String(1000 + pi * 36 + si * 6 + ci).padStart(4, "0");
  return {
    sku: `${product.code}-${colourDef.code}-${sizeCode(size)}`,
    barcode: `896${pad2(pi + 1)}${pad2(si + 1)}${pad2(ci + 1)}${serial}`,
  };
}

export const liveProductById = (id: string): LiveProduct | undefined =>
  LIVE_PRODUCTS.find((p) => p.id === id);

export interface BarcodeMatch {
  product: LiveProduct;
  size: string;
  colour: string;
  variant: LiveVariant;
}

export function liveVariantByBarcode(barcode: string): BarcodeMatch | undefined {
  const code = barcode.trim();
  if (code === "") return undefined;
  for (const product of LIVE_PRODUCTS) {
    for (const size of product.sizes) {
      for (const colour of product.colours) {
        const variant = variantOf(product, size, colour.name);
        if (variant.barcode === code) return { product, size, colour: colour.name, variant };
      }
    }
  }
  return undefined;
}
