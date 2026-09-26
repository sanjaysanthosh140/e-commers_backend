import { Response } from "express";
import Cart from "../mongo_db/Schemas/cart";
import Product from "../mongo_db/Schemas/product";
import Order from "../mongo_db/Schemas/order";
import { AuthRequest } from "./auth/auth_middleware";
import {
  atomicDecrementStock,
  atomicIncrementStock,
  findVariant,
} from "./stock";

type Availability = "ok" | "limited" | "out_of_stock" | "missing";

const enrichCartItems = async (items: any[] = []) => {
  let hasBlockingIssues = false;

  const enriched = await Promise.all(
    items.map(async (item) => {
      const product = await Product.findById(item.productId);
      const variant = product ? findVariant(product, String(item.variantId)) : null;
      const qty = Number(item.quantity) || 1;
      const price = variant ? Number(variant.price) : Number(item.price) || 0;
      const availableStock = variant ? Number(variant.stock) || 0 : 0;

      let availability: Availability = "ok";
      let issue = "";

      if (!product || !variant) {
        availability = "missing";
        issue = "This product is no longer available.";
        hasBlockingIssues = true;
      } else if (availableStock <= 0) {
        availability = "out_of_stock";
        issue = "Out of stock — remove this item before checkout.";
        hasBlockingIssues = true;
      } else if (qty > availableStock) {
        availability = "limited";
        issue = `Only ${availableStock} left. Reduce quantity before checkout.`;
        hasBlockingIssues = true;
      }

      return {
        productId: item.productId,
        variantId: item.variantId,
        sku: item.sku || variant?.sku || "",
        title: item.title || product?.title || "Unknown product",
        size: item.size || variant?.size || "",
        colour: item.colour || variant?.colour || "",
        price,
        quantity: qty,
        image: item.image || variant?.image || product?.images?.[0] || "",
        availableStock,
        availability,
        issue,
        lineTotal: availability === "ok" ? price * qty : 0,
      };
    }),
  );

  const subtotal = enriched
    .filter((i) => i.availability === "ok")
    .reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    items: enriched,
    subtotal,
    canCheckout: !hasBlockingIssues && enriched.length > 0,
    hasBlockingIssues,
  };
};

/** Soft cart: add without decrementing stock. Stock is claimed only at checkout. */
export const add_to_cart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { productId, variantId, quantity = 1 } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Please login to continue" });
    }
    if (!productId || !variantId) {
      return res
        .status(400)
        .json({ message: "productId and variantId are required" });
    }

    const qty = Math.max(1, Number(quantity) || 1);
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variant = findVariant(product, variantId);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    if (!variant.stock || variant.stock <= 0) {
      return res.status(400).json({
        message: "This product is out of stock. You cannot add it to cart.",
        outOfStock: true,
      });
    }

    if (qty > variant.stock) {
      return res.status(400).json({
        message: `Only ${variant.stock} left in stock`,
        stock: variant.stock,
      });
    }

    let cart = await Cart.findOne({ userId });

    if (cart) {
      const itemIndex = cart.items.findIndex(
        (p) =>
          String(p.productId) === String(productId) &&
          String(p.variantId) === String(variantId),
      );

      if (itemIndex !== -1) {
        return res.status(200).json({
          message: "Item is already in your cart",
          alreadyAdded: true,
          cart,
        });
      }

      cart.items.push({
        productId: product._id as any,
        variantId: variant._id,
        sku: variant.sku,
        title: product.title,
        size: variant.size,
        colour: variant.colour,
        price: variant.price,
        image: variant.image || product.images?.[0] || "",
        quantity: qty,
      });
      await cart.save();

      const summary = await enrichCartItems(cart.items);
      return res.status(200).json({
        message: "New item added to your cart",
        cart,
        ...summary,
        stock: variant.stock,
      });
    }

    const newCart = await Cart.create({
      userId,
      items: [
        {
          productId: product._id,
          variantId: variant._id,
          sku: variant.sku,
          title: product.title,
          size: variant.size,
          colour: variant.colour,
          price: variant.price,
          image: variant.image || product.images?.[0] || "",
          quantity: qty,
        },
      ],
    });

    const summary = await enrichCartItems(newCart.items);
    return res.status(201).json({
      message: "Congrats, your cart is created",
      cart: newCart,
      ...summary,
      stock: variant.stock,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add to cart",
      error: error instanceof Error ? error.message : error,
    });
  }
};

/** Returns cart with live stock status so stale items are visible before checkout. */
export const get_cart = async (req: AuthRequest, res: Response) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    const summary = await enrichCartItems(cart?.items || []);

    return res.status(200).json({
      cart: cart || { userId: req.userId, items: [] },
      ...summary,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch cart",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const cart_qty_action = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { productId, variantId, action } = req.body;

    if (!productId || !variantId || !action) {
      return res.status(400).json({
        message: "productId, variantId and action are required",
      });
    }
    if (action !== "increment" && action !== "decrement") {
      return res.status(400).json({
        message: 'action must be "increment" or "decrement"',
      });
    }

    const cart = await Cart.findOne({ userId });
    const product = await Product.findById(productId);

    if (!cart || !product) {
      return res.status(404).json({ message: "Cart or product not found" });
    }

    const cartIndex = cart.items.findIndex(
      (p) =>
        String(p.productId) === String(productId) &&
        String(p.variantId) === String(variantId),
    );

    if (cartIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const variant = findVariant(product, variantId);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    const cartItem = cart.items[cartIndex];

    if (action === "increment") {
      if (cartItem.quantity + 1 > (variant.stock || 0)) {
        return res.status(400).json({
          message:
            variant.stock > 0
              ? `Only ${variant.stock} left in stock`
              : "This product is out of stock. Cannot add more.",
          outOfStock: !variant.stock || variant.stock <= 0,
          stock: variant.stock,
          quantity: cartItem.quantity,
        });
      }
      cartItem.quantity += 1;
    } else if (cartItem.quantity === 1) {
      cart.items.splice(cartIndex, 1);
    } else {
      cartItem.quantity -= 1;
    }

    await cart.save();
    const summary = await enrichCartItems(cart.items);

    return res.status(200).json({
      message:
        action === "increment" ? "Quantity increased" : "Quantity decreased",
      cart,
      ...summary,
      stock: variant.stock,
      quantity:
        cart.items.find(
          (p) =>
            String(p.productId) === String(productId) &&
            String(p.variantId) === String(variantId),
        )?.quantity || 0,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update quantity",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const remove_from_cart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { productId, variantId } = req.body;

    if (!productId || !variantId) {
      return res
        .status(400)
        .json({ message: "productId and variantId are required" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const cartIndex = cart.items.findIndex(
      (p) =>
        String(p.productId) === String(productId) &&
        String(p.variantId) === String(variantId),
    );

    if (cartIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items.splice(cartIndex, 1);
    await cart.save();
    const summary = await enrichCartItems(cart.items);

    return res.status(200).json({
      message: "Item removed from cart",
      cart,
      ...summary,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to remove item",
      error: error instanceof Error ? error.message : error,
    });
  }
};

/**
 * Checkout claims stock atomically per variant.
 * If any claim fails (race / stale stock), previously claimed units are
 * restored and the request fails with 409 — stock never goes negative.
 */
export const checkout_cart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    const summary = await enrichCartItems(cart.items);

    if (!summary.canCheckout) {
      return res.status(409).json({
        message:
          "Checkout blocked: some items are out of stock or no longer available. Update your cart and try again.",
        ...summary,
      });
    }

    const claimed: { productId: string; variantId: string; qty: number }[] = [];
    const failures: {
      productId: string;
      variantId: string;
      title: string;
      reason: string;
    }[] = [];

    for (const item of summary.items) {
      const updated = await atomicDecrementStock(
        String(item.productId),
        String(item.variantId),
        item.quantity,
      );

      if (!updated) {
        failures.push({
          productId: String(item.productId),
          variantId: String(item.variantId),
          title: item.title,
          reason: "Insufficient stock at checkout",
        });
        break;
      }

      claimed.push({
        productId: String(item.productId),
        variantId: String(item.variantId),
        qty: item.quantity,
      });
    }

    if (failures.length > 0) {
      for (const claim of claimed) {
        await atomicIncrementStock(
          claim.productId,
          claim.variantId,
          claim.qty,
        );
      }

      const refreshed = await enrichCartItems(cart.items);
      return res.status(409).json({
        message:
          "Checkout failed: stock changed while you were checking out. Your cart was not charged.",
        failures,
        ...refreshed,
      });
    }

    const orderItems = summary.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      sku: item.sku,
      title: item.title,
      size: item.size,
      colour: item.colour,
      price: item.price,
      quantity: item.quantity,
      lineTotal: item.price * item.quantity,
    }));

    const order = await Order.create({
      userId,
      items: orderItems,
      subtotal: summary.subtotal,
      status: "paid",
    });

    cart.items = [];
    await cart.save();

    return res.status(201).json({
      message: "Checkout successful",
      order: {
        id: order._id,
        subtotal: order.subtotal,
        items: order.items,
        status: order.status,
        createdAt: order.createdAt,
      },
      items: [],
      subtotal: 0,
      canCheckout: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Checkout failed",
      error: error instanceof Error ? error.message : error,
    });
  }
};
