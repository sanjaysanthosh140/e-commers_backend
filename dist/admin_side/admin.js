"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_1 = require("./controller");
const Router = express_1.default.Router();
Router.post("/category", controller_1.store_category_items);
Router.get("/getcategory", controller_1.get_category_items);
Router.post("/products", controller_1.product_items);
Router.get("/products", controller_1.get_products);
Router.get("/products/:id", controller_1.get_product_by_id);
exports.default = Router;
