export type ExpenseCategorySlug =
  | "amashanyarazi"
  | "amazi"
  | "umutekano"
  | "internet"
  | "ubukode"
  | "imyanda"
  | "rssb"
  | "rra"
  | "ibikoresho"
  | "ubwishingizi"
  | "ibindi";

export type ExpenseCategoryMeta = {
  slug: ExpenseCategorySlug;
  label: string;       // Kinyarwanda name
  english: string;     // English hint
  provider: string;    // typical provider in Rwanda
  icon: string;        // emoji used as a lightweight glyph
  bg: string;          // badge background
  color: string;       // badge text
  accent: string;      // strong accent (headers, bars)
  soft: string;        // soft panel background
};

export const EXPENSE_CATEGORIES: ExpenseCategoryMeta[] = [
  { slug: "amashanyarazi", label: "Amashanyarazi", english: "Electricity", provider: "EUCL",          icon: "⚡", bg: "#FEF3C7", color: "#92400E", accent: "#D97706", soft: "#FFFBEB" },
  { slug: "amazi",         label: "Amazi",         english: "Water",       provider: "WASAC",         icon: "💧", bg: "#DBEAFE", color: "#1E40AF", accent: "#2563EB", soft: "#EFF6FF" },
  { slug: "umutekano",     label: "Umutekano",     english: "Security",    provider: "Abarinzi",      icon: "🛡️", bg: "#E2E8F0", color: "#334155", accent: "#475569", soft: "#F8FAFC" },
  { slug: "internet",      label: "Internet",      english: "Internet",    provider: "MTN / Airtel",  icon: "🌐", bg: "#EDE9FE", color: "#5B21B6", accent: "#7C3AED", soft: "#F5F3FF" },
  { slug: "ubukode",       label: "Ubukode",       english: "Rent",        provider: "Nyir'inzu",     icon: "🏠", bg: "#D1FAE5", color: "#065F46", accent: "#059669", soft: "#ECFDF5" },
  { slug: "imyanda",       label: "Imyanda",       english: "Garbage",     provider: "COPED / Ako",   icon: "🗑️", bg: "#FEF9C3", color: "#854D0E", accent: "#CA8A04", soft: "#FEFCE8" },
  { slug: "rssb",          label: "RSSB",          english: "Social sec.", provider: "RSSB",          icon: "🏥", bg: "#FEE2E2", color: "#991B1B", accent: "#DC2626", soft: "#FEF2F2" },
  { slug: "rra",           label: "RRA / Umusoro", english: "Taxes",       provider: "RRA",           icon: "🧾", bg: "#F3F4F6", color: "#374151", accent: "#4B5563", soft: "#F9FAFB" },
  { slug: "ibikoresho",    label: "Ibikoresho",    english: "Supplies",    provider: "Ababicuruza",   icon: "📦", bg: "#CCFBF1", color: "#0F766E", accent: "#0D9488", soft: "#F0FDFA" },
  { slug: "ubwishingizi",  label: "Ubwishingizi",  english: "Insurance",   provider: "Sosiyete",      icon: "📋", bg: "#F3E8FF", color: "#6B21A8", accent: "#9333EA", soft: "#FAF5FF" },
  { slug: "ibindi",        label: "Ibindi",        english: "Other",       provider: "—",             icon: "•",  bg: "#F3F4F6", color: "#374151", accent: "#6B7280", soft: "#F9FAFB" },
];

const BY_SLUG = new Map(EXPENSE_CATEGORIES.map((c) => [c.slug, c]));

export function getCategory(slug: string): ExpenseCategoryMeta | undefined {
  return BY_SLUG.get(slug as ExpenseCategorySlug);
}

export function isCategory(slug: string): slug is ExpenseCategorySlug {
  return BY_SLUG.has(slug as ExpenseCategorySlug);
}
