import mongoose, { Schema, Document } from "mongoose";

// 1. TypeScript Interface
export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Mongoose Schema
const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Category slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Speeds up API lookups like GET /api/products?category=...[cite: 1]
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt timestamps
  },
);

// 3. Export Model
const Category = mongoose.model<ICategory>("Category", categorySchema);
export default Category;
