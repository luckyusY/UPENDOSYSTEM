import { Schema, models, model } from "mongoose";

export type StockMovementType = "kwinjiza" | "gusohoka" | "byangiritse";

export type StockMovementInput = {
  itemId: string;
  date: string;
  type: StockMovementType;
  quantity: number;
  reason: string;
};

const stockMovementSchema = new Schema(
  {
    itemId:   { type: Schema.Types.ObjectId, ref: "StockItem", required: true, index: true },
    date:     { type: String, required: true, index: true },
    type:     { type: String, enum: ["kwinjiza", "gusohoka", "byangiritse"], required: true },
    quantity: { type: Number, required: true, min: 0 },
    reason:   { type: String, default: "" },
  },
  { timestamps: true },
);

export const StockMovement =
  models.StockMovement || model("StockMovement", stockMovementSchema);
