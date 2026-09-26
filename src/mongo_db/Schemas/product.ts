import mongoose, { Schema, Document } from "mongoose";

export interface IVariant {
  sku: string;
  size: string;
  colour: string;
  price: number;
  stock: number;
  image?: string;
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  category: mongoose.Types.ObjectId;
  brand?: string;
  images: string[];
  minPrice: number;
  maxPrice: number;
  variants: IVariant[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const variantSchema = new Schema<IVariant>(
  {
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      trim: true,
    },
    // attributes: {
    size: { type: String, required: true, trim: true },
    colour: { type: String, required: true, trim: true },
    // },
    price: {
      type: Number,
      required: [true, "Variant price is required"],
      min: [0, "Price cannot be negative"],
    },
    stock: {
      type: Number,
      required: [true, "Variant stock count is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    image: { type: String, default: "" },
  },
  { _id: true },
);

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category reference is required"],
      index: true,
    },
    brand: {
      type: String,
      default: "",
      trim: true,
    },
    images: [{ type: String }],
    minPrice: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    maxPrice: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    variants: {
      type: [variantSchema],
      validate: [
        (val: IVariant[]) => val.length > 0,
        "Product must have at least one variant",
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save middleware to auto-calculate price ranges before persisting
productSchema.pre("save", function () {
  if (this.variants && this.variants.length > 0) {
    const prices = this.variants.map((v) => v.price);
    this.minPrice = Math.min(...prices);
    this.maxPrice = Math.max(...prices);
  }
});

// Compound & Performance Indexes
productSchema.index({ category: 1, minPrice: 1, maxPrice: 1 });
productSchema.index({ title: "text", brand: "text" });
productSchema.index({ "variants.attributes.size": 1 });
productSchema.index({ "variants.attributes.color": 1 });

const Product = mongoose.model<IProduct>("Product", productSchema);
export default Product;
