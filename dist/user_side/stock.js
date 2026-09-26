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
exports.findVariant = exports.atomicIncrementStock = exports.atomicDecrementStock = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const product_1 = __importDefault(require("../mongo_db/Schemas/product"));
/**
 * Atomically decrement variant stock only if enough units remain.
 * Uses $elemMatch + arrayFilters so two concurrent checkouts
 * cannot both succeed when only one unit is left.
 *
 * Returns the updated product, or null if stock was insufficient.
 */
const atomicDecrementStock = (productId, variantId, qty) => __awaiter(void 0, void 0, void 0, function* () {
    const amount = Math.max(1, Number(qty) || 1);
    const vId = new mongoose_1.default.Types.ObjectId(variantId);
    return product_1.default.findOneAndUpdate({
        _id: productId,
        variants: {
            $elemMatch: { _id: vId, stock: { $gte: amount } },
        },
    }, { $inc: { "variants.$[elem].stock": -amount } }, {
        arrayFilters: [{ "elem._id": vId }],
        new: true,
    });
});
exports.atomicDecrementStock = atomicDecrementStock;
/** Restore stock after a failed multi-item checkout (compensating increment). */
const atomicIncrementStock = (productId, variantId, qty) => __awaiter(void 0, void 0, void 0, function* () {
    const amount = Math.max(1, Number(qty) || 1);
    const vId = new mongoose_1.default.Types.ObjectId(variantId);
    return product_1.default.findOneAndUpdate({ _id: productId, "variants._id": vId }, { $inc: { "variants.$[elem].stock": amount } }, {
        arrayFilters: [{ "elem._id": vId }],
        new: true,
    });
});
exports.atomicIncrementStock = atomicIncrementStock;
const findVariant = (product, variantId) => {
    var _a, _b, _c;
    return ((_b = (_a = product === null || product === void 0 ? void 0 : product.variants) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.call(_a, variantId)) ||
        ((_c = product === null || product === void 0 ? void 0 : product.variants) === null || _c === void 0 ? void 0 : _c.find((v) => String(v._id) === String(variantId)));
};
exports.findVariant = findVariant;
