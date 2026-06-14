import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import {
  EmployeeTransaction,
  type EmployeeTransactionInput,
} from "@/models/EmployeeTransaction";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await connectMongo();
    const transactions = await EmployeeTransaction.find({ employeeId: id })
      .sort({ date: -1, createdAt: -1 })
      .lean();
    return NextResponse.json({ transactions });
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
    const body = (await request.json()) as Partial<EmployeeTransactionInput>;

    const type = body.type;
    if (type !== "avansi" && type !== "amande" && type !== "bonus") {
      return NextResponse.json({ error: "Ubwoko ntibwemewe." }, { status: 400 });
    }

    await connectMongo();
    const transaction = await EmployeeTransaction.create({
      employeeId: id,
      date:   body.date || new Date().toISOString().slice(0, 10),
      type,
      amount: Math.max(Number(body.amount) || 0, 0),
      reason: body.reason?.trim() || "",
    });
    return NextResponse.json({ transaction }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Kubika byanze." }, { status: 500 });
  }
}
