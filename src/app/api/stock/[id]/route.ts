import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { StockItem } from "@/models/StockItem";
import { StockMovement } from "@/models/StockMovement";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await connectMongo();
    const item = await StockItem.findById(id).lean();
    if (!item) {
      return NextResponse.json({ error: "Ikintu ntikibonetse." }, { status: 404 });
    }
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Ntibyashobotse gufata ikintu." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    await connectMongo();
    const item = await StockItem.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Guhindura byanze." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await connectMongo();
    await StockItem.findByIdAndDelete(id);
    await StockMovement.deleteMany({ itemId: id });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gusiba byanze." }, { status: 500 });
  }
}
