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
exports.checkout_cart = exports.remove_from_cart = exports.cart_qty_action = exports.get_cart = exports.add_to_cart = void 0;
const cart_1 = __importDefault(require("../mongo_db/Schemas/cart"));
const product_1 = __importDefault(require("../mongo_db/Schemas/product"));
const order_1 = __importDefault(require("../mongo_db/Schemas/order"));
const stock_1 = require("./stock");
const enrichCartItems = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (items = []) {
    let hasBlockingIssues = false;
    const enriched = yield Promise.all(items.map((item) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const product = yield product_1.default.findById(item.productId);
        const variant = product ? (0, stock_1.findVariant)(product, String(item.variantId)) : null;
        const qty = Number(item.quantity) || 1;
        const price = variant ? Number(variant.price) : Number(item.price) || 0;
        const availableStock = variant ? Number(variant.stock) || 0 : 0;
        let availability = "ok";
        let issue = "";
        if (!product || !variant) {
            availability = "missing";
            issue = "This product is no longer available.";
            hasBlockingIssues = true;
        }
        else if (availableStock <= 0) {
            availability = "out_of_stock";
            issue = "Out of stock — remove this item before checkout.";
            hasBlockingIssues = true;
        }
        else if (qty > availableStock) {
            availability = "limited";
            issue = `Only ${availableStock} left. Reduce quantity before checkout.`;
            hasBlockingIssues = true;
        }
        return {
            productId: item.productId,
            variantId: item.variantId,
            sku: item.sku || (variant === null || variant === void 0 ? void 0 : variant.sku) || "",
            title: item.title || (product === null || product === void 0 ? void 0 : product.title) || "Unknown product",
            size: item.size || (variant === null || variant === void 0 ? void 0 : variant.size) || "",
            colour: item.colour || (variant === null || variant === void 0 ? void 0 : variant.colour) || "",
            price,
            quantity: qty,
            image: item.image || (variant === null || variant === void 0 ? void 0 : variant.image) || ((_a = product === null || product === void 0 ? void 0 : product.images) === null || _a === void 0 ? void 0 : _a[0]) || "",
            availableStock,
            availability,
            issue,
            lineTotal: availability === "ok" ? price * qty : 0,
        };
    })));
    const subtotal = enriched
        .filter((i) => i.availability === "ok")
        .reduce((sum, i) => sum + i.price * i.quantity, 0);
    return {
        items: enriched,
        subtotal,
        canCheckout: !hasBlockingIssues && enriched.length > 0,
        hasBlockingIssues,
    };
});
/** Soft cart: add without decrementing stock. Stock is claimed only at checkout. */
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
        const variant = (0, stock_1.findVariant)(product, variantId);
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
            yield cart.save();
            const summary = yield enrichCartItems(cart.items);
            return res.status(200).json(Object.assign(Object.assign({ message: "New item added to your cart", cart }, summary), { stock: variant.stock }));
        }
        const newCart = yield cart_1.default.create({
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
        const summary = yield enrichCartItems(newCart.items);
        return res.status(201).json(Object.assign(Object.assign({ message: "Congrats, your cart is created", cart: newCart }, summary), { stock: variant.stock }));
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to add to cart",
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.add_to_cart = add_to_cart;
/** Returns cart with live stock status so stale items are visible before checkout. */
const get_cart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cart = yield cart_1.default.findOne({ userId: req.userId });
        const summary = yield enrichCartItems((cart === null || cart === void 0 ? void 0 : cart.items) || []);
        return res.status(200).json(Object.assign({ cart: cart || { userId: req.userId, items: [] } }, summary));
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
    var _a;
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
        const variant = (0, stock_1.findVariant)(product, variantId);
        if (!variant) {
            return res.status(404).json({ message: "Variant not found" });
        }
        const cartItem = cart.items[cartIndex];
        if (action === "increment") {
            if (cartItem.quantity + 1 > (variant.stock || 0)) {
                return res.status(400).json({
                    message: variant.stock > 0
                        ? `Only ${variant.stock} left in stock`
                        : "This product is out of stock. Cannot add more.",
                    outOfStock: !variant.stock || variant.stock <= 0,
                    stock: variant.stock,
                    quantity: cartItem.quantity,
                });
            }
            cartItem.quantity += 1;
        }
        else if (cartItem.quantity === 1) {
            cart.items.splice(cartIndex, 1);
        }
        else {
            cartItem.quantity -= 1;
        }
        yield cart.save();
        const summary = yield enrichCartItems(cart.items);
        return res.status(200).json(Object.assign(Object.assign({ message: action === "increment" ? "Quantity increased" : "Quantity decreased", cart }, summary), { stock: variant.stock, quantity: ((_a = cart.items.find((p) => String(p.productId) === String(productId) &&
                String(p.variantId) === String(variantId))) === null || _a === void 0 ? void 0 : _a.quantity) || 0 }));
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
        cart.items.splice(cartIndex, 1);
        yield cart.save();
        const summary = yield enrichCartItems(cart.items);
        return res.status(200).json(Object.assign({ message: "Item removed from cart", cart }, summary));
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to remove item",
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.remove_from_cart = remove_from_cart;
/**
 * Checkout claims stock atomically per variant.
 * If any claim fails (race / stale stock), previously claimed units are
 * restored and the request fails with 409 — stock never goes negative.
 */
const checkout_cart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const cart = yield cart_1.default.findOne({ userId });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Your cart is empty" });
        }
        const summary = yield enrichCartItems(cart.items);
        if (!summary.canCheckout) {
            return res.status(409).json(Object.assign({ message: "Checkout blocked: some items are out of stock or no longer available. Update your cart and try again." }, summary));
        }
        const claimed = [];
        const failures = [];
        for (const item of summary.items) {
            const updated = yield (0, stock_1.atomicDecrementStock)(String(item.productId), String(item.variantId), item.quantity);
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
                yield (0, stock_1.atomicIncrementStock)(claim.productId, claim.variantId, claim.qty);
            }
            const refreshed = yield enrichCartItems(cart.items);
            return res.status(409).json(Object.assign({ message: "Checkout failed: stock changed while you were checking out. Your cart was not charged.", failures }, refreshed));
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
        const order = yield order_1.default.create({
            userId,
            items: orderItems,
            subtotal: summary.subtotal,
            status: "paid",
        });
        cart.items = [];
        yield cart.save();
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
    }
    catch (error) {
        return res.status(500).json({
            message: "Checkout failed",
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.checkout_cart = checkout_cart;
