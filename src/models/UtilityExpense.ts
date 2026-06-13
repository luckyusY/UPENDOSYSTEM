import { Schema, models, model } from "mongoose";

export type UtilityCategory =
  | "amashanyarazi"
  | "amazi"
  | "internet"
  | "ubukode"
  | "rssb"
  | "rra"
  | "ibikoresho"
  | "ubwishingizi"
  | "ibindi";

export type UtilityExpenseInput = {
  date: string;
  category: UtilityCategory;
  amount: number;
  provider: string;
  reference: string;
  notes: string;
};

const utilityExpenseSchema = new Schema(
  {
    date:      { type: String, required: true, index: true },
    category:  { type: String, required: true },
    amount:    { type: Number, required: true, min: 0 },
    provider:  { type: String, default: "" },
    reference: { type: String, default: "" },
    notes:     { type: String, default: "" },
  },
  { timestamps: true },
);

export const UtilityExpense =
  models.UtilityExpense || model("UtilityExpense", utilityExpenseSchema);
