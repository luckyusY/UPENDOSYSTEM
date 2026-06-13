import { Schema, models, model } from "mongoose";

export type OperationRecordInput = {
  date: string;
  shift: "amanywa" | "nimugoroba" | "umunsi-wose";
  barSales: number;
  restaurantSales: number;
  cashSales: number;
  mobileMoneySales: number;
  cardSales: number;
  creditSales: number;
  expenses: number;
  purchases: number;
  openingStock: number;
  closingStock: number;
  wastage: number;
  staffCount: number;
  notes?: string;
};

const operationRecordSchema = new Schema(
  {
    date: { type: String, required: true, index: true },
    shift: {
      type: String,
      enum: ["amanywa", "nimugoroba", "umunsi-wose"],
      default: "umunsi-wose",
    },
    barSales: { type: Number, default: 0 },
    restaurantSales: { type: Number, default: 0 },
    cashSales: { type: Number, default: 0 },
    mobileMoneySales: { type: Number, default: 0 },
    cardSales: { type: Number, default: 0 },
    creditSales: { type: Number, default: 0 },
    expenses: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    openingStock: { type: Number, default: 0 },
    closingStock: { type: Number, default: 0 },
    wastage: { type: Number, default: 0 },
    staffCount: { type: Number, default: 0 },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

export const OperationRecord =
  models.OperationRecord || model("OperationRecord", operationRecordSchema);
