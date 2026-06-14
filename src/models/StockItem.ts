import { Schema, models, model } from "mongoose";

export type StockItemInput = {
  name: string;
  category: string;
  unit: string;       // base unit, e.g. "icupa" (bottle)
  packSize: number;   // base units per package, e.g. 24
  packUnit: string;   // package name, e.g. "agasanduku" (crate)
  quantity: number;   // always stored in base units
  reorderLevel: number;
  unitCost: number;   // buying price per base unit
  unitPrice: number;  // selling price per base unit
  supplier: string;
  notes: string;
};

const stockItemSchema = new Schema(
  {
    name:         { type: String, required: true, index: true },
    category:     { type: String, default: "ibindi" },
    unit:         { type: String, default: "icupa" },
    packSize:     { type: Number, default: 1 },
    packUnit:     { type: String, default: "" },
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
