import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { StockItem, type StockItemInput } from "@/models/StockItem";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function GET() {
  try {
    await connectMongo();
    const items = await StockItem.find({}).sort({ name: 1 }).lean();
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Ntibyashobotse gufata ububiko." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<StockItemInput>;
    await connectMongo();
    const item = await StockItem.create({
      name:         body.name?.trim() || "—",
      category:     body.category || "ibindi",
      unit:         body.unit?.trim() || "icupa",
      packSize:     Math.max(Number(body.packSize) || 1, 1),
      packUnit:     body.packUnit?.trim() || "",
      quantity:     Math.max(Number(body.quantity) || 0, 0),
      reorderLevel: Math.max(Number(body.reorderLevel) || 0, 0),
      unitCost:     Math.max(Number(body.unitCost) || 0, 0),
      unitPrice:    Math.max(Number(body.unitPrice) || 0, 0),
      supplier:     body.supplier?.trim() || "",
      notes:        body.notes?.trim() || "",
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Kubika byanze." }, { status: 500 });
  }
}
