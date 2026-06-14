import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { StockItem } from "@/models/StockItem";
import {
  StockMovement,
  type StockMovementInput,
} from "@/models/StockMovement";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await connectMongo();
    const movements = await StockMovement.find({ itemId: id })
      .sort({ date: -1, createdAt: -1 })
      .lean();
    return NextResponse.json({ movements });
  } catch {
    return NextResponse.json({ error: "Ntibyashobotse gufata amakuru." }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Partial<StockMovementInput>;

    const type = body.type;
    if (type !== "kwinjiza" && type !== "gusohoka" && type !== "byangiritse") {
      return NextResponse.json({ error: "Ubwoko ntibwemewe." }, { status: 400 });
    }

    const quantity = Math.max(Number(body.quantity) || 0, 0);

    await connectMongo();
    const movement = await StockMovement.create({
      itemId: id,
      date:   body.date || new Date().toISOString().slice(0, 10),
      type,
      quantity,
      reason: body.reason?.trim() || "",
    });

    // Apply the movement to the item's running quantity.
    const delta = type === "kwinjiza" ? quantity : -quantity;
    const item = await StockItem.findByIdAndUpdate(
      id,
      { $inc: { quantity: delta } },
      { new: true },
    );

    return NextResponse.json({ movement, item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Kubika byanze." }, { status: 500 });
  }
}
