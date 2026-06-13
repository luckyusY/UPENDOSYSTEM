import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import {
  OperationRecord,
  type OperationRecordInput,
} from "@/models/OperationRecord";

function cleanNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function normalizeRecord(body: Partial<OperationRecordInput>) {
  const record: OperationRecordInput = {
    date: body.date || new Date().toISOString().slice(0, 10),
    shift: body.shift || "umunsi-wose",
    barSales: cleanNumber(body.barSales),
    restaurantSales: cleanNumber(body.restaurantSales),
    cashSales: cleanNumber(body.cashSales),
    mobileMoneySales: cleanNumber(body.mobileMoneySales),
    cardSales: cleanNumber(body.cardSales),
    creditSales: cleanNumber(body.creditSales),
    expenses: cleanNumber(body.expenses),
    purchases: cleanNumber(body.purchases),
    openingStock: cleanNumber(body.openingStock),
    closingStock: cleanNumber(body.closingStock),
    wastage: cleanNumber(body.wastage),
    staffCount: cleanNumber(body.staffCount),
    notes: body.notes?.trim() || "",
  };

  return record;
}

export async function GET() {
  try {
    await connectMongo();
    const records = await OperationRecord.find({})
      .sort({ date: -1, createdAt: -1 })
      .limit(60)
      .lean();

    return NextResponse.json({ records });
  } catch {
    return NextResponse.json(
      { error: "Ntibyashobotse gufata raporo." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<OperationRecordInput>;
    const record = normalizeRecord(body);

    await connectMongo();
    const created = await OperationRecord.create(record);

    return NextResponse.json({ record: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Ntibyashobotse kubika raporo." },
      { status: 500 },
    );
  }
}
