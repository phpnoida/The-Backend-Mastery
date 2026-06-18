import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getOneProduct,
  updateProduct,
} from "./product.controller";

const router = Router();
router.route("/products").post(createProduct);
router.route("/products/:id").patch(updateProduct);
router.route("/products").get(getAllProducts);
router.route("/products/:id").get(getOneProduct);

export default router;
