import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { UtilityExpense, type UtilityExpenseInput } from "@/models/UtilityExpense";

export async function GET() {
  try {
    await connectMongo();
    const expenses = await UtilityExpense.find({})
      .sort({ date: -1, createdAt: -1 })
      .limit(200)
      .lean();
    return NextResponse.json({ expenses });
  } catch {
    return NextResponse.json({ error: "Ntibyashobotse gufata amakuru." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<UtilityExpenseInput>;
    await connectMongo();
    const expense = await UtilityExpense.create({
      date:      body.date      || new Date().toISOString().slice(0, 10),
      category:  body.category  || "ibindi",
      amount:    Math.max(Number(body.amount) || 0, 0),
      provider:  body.provider?.trim()  || "",
      reference: body.reference?.trim() || "",
      notes:     body.notes?.trim()     || "",
    });
    return NextResponse.json({ expense }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Kubika byanze." }, { status: 500 });
  }
}
