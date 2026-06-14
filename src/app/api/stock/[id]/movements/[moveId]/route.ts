import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { StockItem } from "@/models/StockItem";
import { StockMovement } from "@/models/StockMovement";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; moveId: string }> },
) {
  try {
    const { id, moveId } = await params;
    await connectMongo();

    const movement = await StockMovement.findById(moveId);
    if (movement) {
      // Reverse the movement's effect on the running quantity.
      const applied = movement.type === "kwinjiza" ? movement.quantity : -movement.quantity;
      await StockItem.findByIdAndUpdate(id, { $inc: { quantity: -applied } });
      await movement.deleteOne();
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gusiba byanze." }, { status: 500 });
  }
}
