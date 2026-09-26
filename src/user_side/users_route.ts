import express from "express";
import { user_login, user_signup } from "./controller";
import {
  add_to_cart,
  cart_qty_action,
  checkout_cart,
  get_cart,
  remove_from_cart,
} from "./cart_controller";
import { authMiddleware } from "./auth/auth_middleware";

const Router = express.Router();

Router.post("/sign_up", user_signup);
Router.post("/login", user_login);

Router.post("/cart/add", authMiddleware, add_to_cart);
Router.get("/cart", authMiddleware, get_cart);
Router.patch("/cart/qty", authMiddleware, cart_qty_action);
Router.delete("/cart/item", authMiddleware, remove_from_cart);
Router.post("/cart/checkout", authMiddleware, checkout_cart);

export default Router;
