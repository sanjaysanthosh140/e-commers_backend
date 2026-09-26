import mongoose from "mongoose";
import Product from "../mongo_db/Schemas/product";

/**
 * Atomically decrement variant stock only if enough units remain.
 * Uses $elemMatch + arrayFilters so two concurrent checkouts
 * cannot both succeed when only one unit is left.
 *
 * Returns the updated product, or null if stock was insufficient.
 */
export const atomicDecrementStock = async (
  productId: string,
  variantId: string,
  qty: number,
) => {
  const amount = Math.max(1, Number(qty) || 1);
  const vId = new mongoose.Types.ObjectId(variantId);

  return Product.findOneAndUpdate(
    {
      _id: productId,
      variants: {
        $elemMatch: { _id: vId, stock: { $gte: amount } },
      },
    },
    { $inc: { "variants.$[elem].stock": -amount } },
    {
      arrayFilters: [{ "elem._id": vId }],
      new: true,
    },
  );
};

/** Restore stock after a failed multi-item checkout (compensating increment). */
export const atomicIncrementStock = async (
  productId: string,
  variantId: string,
  qty: number,
) => {
  const amount = Math.max(1, Number(qty) || 1);
  const vId = new mongoose.Types.ObjectId(variantId);

  return Product.findOneAndUpdate(
    { _id: productId, "variants._id": vId },
    { $inc: { "variants.$[elem].stock": amount } },
    {
      arrayFilters: [{ "elem._id": vId }],
      new: true,
    },
  );
};

export const findVariant = (product: any, variantId: string) =>
  product?.variants?.id?.(variantId) ||
  product?.variants?.find((v: any) => String(v._id) === String(variantId));
