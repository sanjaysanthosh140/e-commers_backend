"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const variantSchema = new mongoose_1.Schema({
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
}, { _id: true });
const productSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
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
            (val) => val.length > 0,
            "Product must have at least one variant",
        ],
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
}, {
    timestamps: true,
});
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
const Product = mongoose_1.default.model("Product", productSchema);
exports.default = Product;
