import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getOneProduct,
  updateProduct,
} from "./product.controller";
import validateRequest from "@/middlewares/validateRequest";
import {
  productCreateSchema,
  productParamsSchema,
  productQuerySchema,
  productUpdateSchema,
} from "./product.schema";

const router = Router();
router
  .route("/products")
  .post(validateRequest(productCreateSchema, "body"), createProduct);
router
  .route("/products/:id")
  .patch(
    validateRequest(productUpdateSchema, "body"),
    validateRequest(productParamsSchema, "params"),
    updateProduct
  );
router
  .route("/products")
  .get(validateRequest(productQuerySchema, "query"), getAllProducts);
router
  .route("/products/:id")
  .get(validateRequest(productParamsSchema, "params"), getOneProduct);

export default router;
