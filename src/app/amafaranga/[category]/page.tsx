import { notFound } from "next/navigation";
import { ExpenseCategoryPage } from "@/components/ExpenseCategoryPage";
import { getCategory, isCategory } from "@/lib/expenseCategories";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const meta = getCategory(category);
  return { title: meta ? `${meta.label} — Upendo System` : "Amafaranga — Upendo System" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!isCategory(category)) notFound();
  return <ExpenseCategoryPage category={category} />;
}
