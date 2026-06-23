import { Router } from "express";
import {
  createProduct,
  deleteProduct,
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
  .post(validateRequest(productCreateSchema, "body"), createProduct)
  .get(validateRequest(productQuerySchema, "query"), getAllProducts);
router
  .route("/products/:id")
  .get(validateRequest(productParamsSchema, "params"), getOneProduct)
  .delete(validateRequest(productParamsSchema, "params"), deleteProduct)
  .patch(
    validateRequest(productParamsSchema, "params"),
    validateRequest(productUpdateSchema, "body"),
    updateProduct
  );

export default router;
