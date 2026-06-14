import { EmployeeDetail } from "@/components/EmployeeDetail";

export const metadata = { title: "Umukozi — Upendo System" };

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EmployeeDetail employeeId={id} />;
}
