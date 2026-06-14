export type StockCategorySlug =
  | "inzoga"
  | "spirits"
  | "ibinyobwa"
  | "ibiribwa"
  | "ibindi";

export type StockCategoryMeta = {
  slug: StockCategorySlug;
  label: string;    // Kinyarwanda
  english: string;
  icon: string;
  bg: string;
  color: string;
  accent: string;
};

export const STOCK_CATEGORIES: StockCategoryMeta[] = [
  { slug: "inzoga",    label: "Inzoga",        english: "Beer",        icon: "🍺", bg: "#FEF3C7", color: "#92400E", accent: "#D97706" },
  { slug: "spirits",   label: "Spirits",       english: "Spirits",     icon: "🥃", bg: "#EDE9FE", color: "#5B21B6", accent: "#7C3AED" },
  { slug: "ibinyobwa", label: "Ibinyobwa",     english: "Soft drinks", icon: "🥤", bg: "#DBEAFE", color: "#1E40AF", accent: "#2563EB" },
  { slug: "ibiribwa",  label: "Ibiribwa",      english: "Food",        icon: "🍽️", bg: "#D1FAE5", color: "#065F46", accent: "#059669" },
  { slug: "ibindi",    label: "Ibindi",        english: "Other",       icon: "📦", bg: "#F3F4F6", color: "#374151", accent: "#6B7280" },
];

const BY_SLUG = new Map(STOCK_CATEGORIES.map((c) => [c.slug, c]));

export function getStockCategory(slug: string): StockCategoryMeta | undefined {
  return BY_SLUG.get(slug as StockCategorySlug);
}

export const STOCK_UNITS = [
  "icupa",       // bottle
  "agasanduku",  // crate / box
  "lita",        // liter
  "kilo",        // kg
  "ibice",       // pieces
  "isahane",     // plate / serving
];
