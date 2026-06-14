import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { EmployeeTransaction } from "@/models/EmployeeTransaction";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; txId: string }> },
) {
  try {
    const { txId } = await params;
    await connectMongo();
    await EmployeeTransaction.findByIdAndDelete(txId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gusiba byanze." }, { status: 500 });
  }
}
