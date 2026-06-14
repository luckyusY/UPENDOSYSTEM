import { Schema, models, model } from "mongoose";

export type TransactionType = "avansi" | "amande" | "bonus";

export type EmployeeTransactionInput = {
  employeeId: string;
  date: string;
  type: TransactionType;
  amount: number;
  reason: string;
};

const employeeTransactionSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    date:       { type: String, required: true, index: true },
    type:       { type: String, enum: ["avansi", "amande", "bonus"], required: true },
    amount:     { type: Number, required: true, min: 0 },
    reason:     { type: String, default: "" },
  },
  { timestamps: true },
);

export const EmployeeTransaction =
  models.EmployeeTransaction ||
  model("EmployeeTransaction", employeeTransactionSchema);
