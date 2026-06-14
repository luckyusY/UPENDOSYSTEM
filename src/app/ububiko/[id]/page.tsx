import { StockItemDetail } from "@/components/StockItemDetail";

export const metadata = { title: "Ikintu — Ububiko — Upendo System" };

export default async function StockItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StockItemDetail itemId={id} />;
}
