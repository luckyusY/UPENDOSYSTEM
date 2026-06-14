import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Employee } from "@/models/Employee";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await connectMongo();
    const employee = await Employee.findById(id).lean();
    if (!employee) {
      return NextResponse.json({ error: "Umukozi ntiyabonetse." }, { status: 404 });
    }
    return NextResponse.json({ employee });
  } catch {
    return NextResponse.json({ error: "Ntibyashobotse gufata umukozi." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await connectMongo();
    await Employee.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gusiba byanze." }, { status: 500 });
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
    const employee = await Employee.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ employee });
  } catch {
    return NextResponse.json({ error: "Guhindura byanze." }, { status: 500 });
  }
}
