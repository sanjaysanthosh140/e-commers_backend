import express from "express";
import {
  get_category_items,
  get_product_by_id,
  get_products,
  product_items,
  store_category_items,
} from "./controller";

const Router = express.Router();

Router.post("/category", store_category_items);
Router.get("/getcategory", get_category_items);
Router.post("/products", product_items);
Router.get("/products", get_products);
Router.get("/products/:id", get_product_by_id);
export default Router;
