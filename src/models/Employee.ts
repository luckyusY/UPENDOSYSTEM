import { Schema, models, model } from "mongoose";

export type EmployeeStatus = "active" | "inactive";

export type EmployeeInput = {
  fullName: string;
  role: string;
  phone: string;
  salary: number;
  startDate: string;
  status: EmployeeStatus;
  idNumber: string;
  notes: string;
};

const employeeSchema = new Schema(
  {
    fullName:  { type: String, required: true },
    role:      { type: String, required: true },
    phone:     { type: String, default: "" },
    salary:    { type: Number, default: 0 },
    startDate: { type: String, required: true, index: true },
    status:    { type: String, enum: ["active", "inactive"], default: "active" },
    idNumber:  { type: String, default: "" },
    notes:     { type: String, default: "" },
  },
  { timestamps: true },
);

export const Employee = models.Employee || model("Employee", employeeSchema);
