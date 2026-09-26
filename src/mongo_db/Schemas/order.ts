import mongoose, { Schema, Document, Types } from "mongoose";

export interface IOrderItem {
  productId: Types.ObjectId;
  variantId: Types.ObjectId;
  sku: string;
  title: string;
  size: string;
  colour: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  status: "paid" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: Schema.Types.ObjectId, required: true },
    sku: { type: String, required: true },
    title: { type: String, required: true },
    size: { type: String, default: "" },
    colour: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["paid", "failed"],
      default: "paid",
    },
  },
  { timestamps: true },
);

const Order = mongoose.model<IOrder>("Order", orderSchema);
export default Order;
