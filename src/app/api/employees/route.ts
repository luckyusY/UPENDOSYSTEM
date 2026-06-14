import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Employee, type EmployeeInput } from "@/models/Employee";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function GET() {
  try {
    await connectMongo();
    const employees = await Employee.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ employees });
  } catch {
    return NextResponse.json({ error: "Ntibyashobotse gufata amakuru." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<EmployeeInput>;
    await connectMongo();
    const employee = await Employee.create({
      fullName:  body.fullName?.trim() || "—",
      role:      body.role?.trim()     || "Ibindi",
      phone:     body.phone?.trim()    || "",
      salary:    Math.max(Number(body.salary) || 0, 0),
      startDate: body.startDate        || new Date().toISOString().slice(0, 10),
      status:    body.status           || "active",
      idNumber:  body.idNumber?.trim() || "",
      notes:     body.notes?.trim()    || "",
    });
    return NextResponse.json({ employee }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Kubika byanze." }, { status: 500 });
  }
}
