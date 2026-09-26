"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_1 = require("./controller");
const cart_controller_1 = require("./cart_controller");
const auth_middleware_1 = require("./auth/auth_middleware");
const Router = express_1.default.Router();
Router.post("/sign_up", controller_1.user_signup);
Router.post("/login", controller_1.user_login);
Router.post("/cart/add", auth_middleware_1.authMiddleware, cart_controller_1.add_to_cart);
Router.get("/cart", auth_middleware_1.authMiddleware, cart_controller_1.get_cart);
Router.patch("/cart/qty", auth_middleware_1.authMiddleware, cart_controller_1.cart_qty_action);
Router.delete("/cart/item", auth_middleware_1.authMiddleware, cart_controller_1.remove_from_cart);
exports.default = Router;
