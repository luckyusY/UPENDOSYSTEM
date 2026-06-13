import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { UtilityExpense } from "@/models/UtilityExpense";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await connectMongo();
    await UtilityExpense.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gusiba byanze." }, { status: 500 });
  }
}
