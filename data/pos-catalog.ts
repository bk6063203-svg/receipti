/* Urban Threads — demo catalog (Phase 03). Prices in AED, tax-inclusive. */
import type { Product, ProductCategory } from "@/types/pos";

export const POS_MERCHANT = "Urban Threads";
export const POS_BRANCH = "Dubai Mall";
export const POS_CURRENCY = "AED" as const;

export interface CatalogProduct extends Product {
  details?: { color?: string; size?: string };
}

export const POS_CATEGORIES: ("All" | ProductCategory)[] = [
  "All",
  "Clothing",
  "Footwear",
  "Accessories",
];

export const POS_PRODUCTS: CatalogProduct[] = [
  {
    id: "p-jacket",
    name: "Jacket",
    category: "Clothing",
    price: { amountMinor: 150000, currency: "AED" },
    image: "/images/jacket.jpg",
    imageAlt: "Camel-colored zip-up jacket",
    sku: "UT-JKT-01",
    details: { color: "Camel", size: "Large" },
  },
  {
    id: "p-sneakers",
    name: "Sneakers",
    category: "Footwear",
    price: { amountMinor: 65000, currency: "AED" },
    image: "/images/products/sneakers.jpg",
    imageAlt: "White and green running sneaker",
    sku: "UT-SNK-02",
    details: { color: "White / Sage", size: "UK 9" },
  },
  {
    id: "p-tshirt",
    name: "T-Shirt",
    category: "Clothing",
    price: { amountMinor: 18000, currency: "AED" },
    image: "/images/products/tshirt.jpg",
    imageAlt: "Forest-green crew-neck t-shirt",
    sku: "UT-TSH-03",
    details: { color: "Forest Green", size: "Medium" },
  },
  {
    id: "p-jeans",
    name: "Jeans",
    category: "Clothing",
    price: { amountMinor: 32000, currency: "AED" },
    image: "/images/products/jeans.jpg",
    imageAlt: "Dark indigo slim-fit jeans",
    sku: "UT-JNS-04",
    details: { color: "Indigo", size: "32" },
  },
  {
    id: "p-hoodie",
    name: "Hoodie",
    category: "Clothing",
    price: { amountMinor: 28000, currency: "AED" },
    image: "/images/products/hoodie.jpg",
    imageAlt: "Heather-gray pullover hoodie",
    sku: "UT-HDD-05",
    details: { color: "Heather Gray", size: "Large" },
  },
  {
    id: "p-cap",
    name: "Cap",
    category: "Accessories",
    price: { amountMinor: 12000, currency: "AED" },
    image: "/images/products/cap.jpg",
    imageAlt: "Beige canvas baseball cap",
    sku: "UT-CAP-06",
    details: { color: "Beige", size: "One size" },
  },
];
