import { Schema, models, model } from "mongoose";

export type StockItemInput = {
  name: string;
  category: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  unitCost: number;   // buying price per unit
  unitPrice: number;  // selling price per unit
  supplier: string;
  notes: string;
};

const stockItemSchema = new Schema(
  {
    name:         { type: String, required: true, index: true },
    category:     { type: String, default: "ibindi" },
    unit:         { type: String, default: "icupa" },
    quantity:     { type: Number, default: 0 },
    reorderLevel: { type: Number, default: 0 },
    unitCost:     { type: Number, default: 0 },
    unitPrice:    { type: Number, default: 0 },
    supplier:     { type: String, default: "" },
    notes:        { type: String, default: "" },
  },
  { timestamps: true },
);

export const StockItem = models.StockItem || model("StockItem", stockItemSchema);
