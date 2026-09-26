import { Response } from "express";
import Cart from "../mongo_db/Schemas/cart";
import Product from "../mongo_db/Schemas/product";
import { AuthRequest } from "./auth/auth_middleware";

const findVariant = (product: any, variantId: string) =>
  product.variants.id?.(variantId) ||
  product.variants.find((v: any) => String(v._id) === String(variantId));

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

      variant.stock -= qty;
      await product.save();
      await cart.save();

      return res.status(200).json({
        message: "New item added to your cart",
        cart,
        stock: variant.stock,
      });
    }

    const newCart = new Cart({
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

    variant.stock -= qty;
    await product.save();
    await newCart.save();

    return res.status(201).json({
      message: "Congrats, your cart is created",
      cart: newCart,
      stock: variant.stock,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add to cart",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const get_cart = async (req: AuthRequest, res: Response) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    return res.status(200).json({
      cart: cart || { userId: req.userId, items: [] },
      items: cart?.items || [],
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
      if (!variant.stock || variant.stock <= 0) {
        return res.status(400).json({
          message: "This product is out of stock. Cannot add more.",
          outOfStock: true,
          cart,
          quantity: cartItem.quantity,
        });
      }
      cartItem.quantity += 1;
      variant.stock -= 1;
    } else {
      if (cartItem.quantity === 1) {
        cart.items.splice(cartIndex, 1);
        variant.stock += 1;
      } else {
        cartItem.quantity -= 1;
        variant.stock += 1;
      }
    }

    await product.save();
    await cart.save();

    const updatedItem = cart.items.find(
      (p) =>
        String(p.productId) === String(productId) &&
        String(p.variantId) === String(variantId),
    );

    return res.status(200).json({
      message:
        action === "increment" ? "Quantity increased" : "Quantity decreased",
      cart,
      stock: variant.stock,
      quantity: updatedItem?.quantity || 0,
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

    const removed = cart.items[cartIndex];
    cart.items.splice(cartIndex, 1);

    const product = await Product.findById(productId);
    if (product) {
      const variant = findVariant(product, variantId);
      if (variant) {
        variant.stock += removed.quantity;
        await product.save();
      }
    }

    await cart.save();

    return res.status(200).json({
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to remove item",
      error: error instanceof Error ? error.message : error,
    });
  }
};
