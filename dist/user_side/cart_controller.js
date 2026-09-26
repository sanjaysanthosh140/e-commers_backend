"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove_from_cart = exports.cart_qty_action = exports.get_cart = exports.add_to_cart = void 0;
const cart_1 = __importDefault(require("../mongo_db/Schemas/cart"));
const product_1 = __importDefault(require("../mongo_db/Schemas/product"));
const findVariant = (product, variantId) => {
    var _a, _b;
    return ((_b = (_a = product.variants).id) === null || _b === void 0 ? void 0 : _b.call(_a, variantId)) ||
        product.variants.find((v) => String(v._id) === String(variantId));
};
const add_to_cart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
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
        const product = yield product_1.default.findById(productId);
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
        let cart = yield cart_1.default.findOne({ userId });
        if (cart) {
            const itemIndex = cart.items.findIndex((p) => String(p.productId) === String(productId) &&
                String(p.variantId) === String(variantId));
            if (itemIndex !== -1) {
                return res.status(200).json({
                    message: "Item is already in your cart",
                    alreadyAdded: true,
                    cart,
                });
            }
            cart.items.push({
                productId: product._id,
                variantId: variant._id,
                sku: variant.sku,
                title: product.title,
                size: variant.size,
                colour: variant.colour,
                price: variant.price,
                image: variant.image || ((_a = product.images) === null || _a === void 0 ? void 0 : _a[0]) || "",
                quantity: qty,
            });
            variant.stock -= qty;
            yield product.save();
            yield cart.save();
            return res.status(200).json({
                message: "New item added to your cart",
                cart,
                stock: variant.stock,
            });
        }
        const newCart = new cart_1.default({
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
                    image: variant.image || ((_b = product.images) === null || _b === void 0 ? void 0 : _b[0]) || "",
                    quantity: qty,
                },
            ],
        });
        variant.stock -= qty;
        yield product.save();
        yield newCart.save();
        return res.status(201).json({
            message: "Congrats, your cart is created",
            cart: newCart,
            stock: variant.stock,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to add to cart",
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.add_to_cart = add_to_cart;
const get_cart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cart = yield cart_1.default.findOne({ userId: req.userId });
        return res.status(200).json({
            cart: cart || { userId: req.userId, items: [] },
            items: (cart === null || cart === void 0 ? void 0 : cart.items) || [],
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch cart",
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.get_cart = get_cart;
const cart_qty_action = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const cart = yield cart_1.default.findOne({ userId });
        const product = yield product_1.default.findById(productId);
        if (!cart || !product) {
            return res.status(404).json({ message: "Cart or product not found" });
        }
        const cartIndex = cart.items.findIndex((p) => String(p.productId) === String(productId) &&
            String(p.variantId) === String(variantId));
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
        }
        else {
            if (cartItem.quantity === 1) {
                cart.items.splice(cartIndex, 1);
                variant.stock += 1;
            }
            else {
                cartItem.quantity -= 1;
                variant.stock += 1;
            }
        }
        yield product.save();
        yield cart.save();
        const updatedItem = cart.items.find((p) => String(p.productId) === String(productId) &&
            String(p.variantId) === String(variantId));
        return res.status(200).json({
            message: action === "increment" ? "Quantity increased" : "Quantity decreased",
            cart,
            stock: variant.stock,
            quantity: (updatedItem === null || updatedItem === void 0 ? void 0 : updatedItem.quantity) || 0,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to update quantity",
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.cart_qty_action = cart_qty_action;
const remove_from_cart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { productId, variantId } = req.body;
        if (!productId || !variantId) {
            return res
                .status(400)
                .json({ message: "productId and variantId are required" });
        }
        const cart = yield cart_1.default.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        const cartIndex = cart.items.findIndex((p) => String(p.productId) === String(productId) &&
            String(p.variantId) === String(variantId));
        if (cartIndex === -1) {
            return res.status(404).json({ message: "Item not found in cart" });
        }
        const removed = cart.items[cartIndex];
        cart.items.splice(cartIndex, 1);
        const product = yield product_1.default.findById(productId);
        if (product) {
            const variant = findVariant(product, variantId);
            if (variant) {
                variant.stock += removed.quantity;
                yield product.save();
            }
        }
        yield cart.save();
        return res.status(200).json({
            message: "Item removed from cart",
            cart,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to remove item",
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.remove_from_cart = remove_from_cart;
