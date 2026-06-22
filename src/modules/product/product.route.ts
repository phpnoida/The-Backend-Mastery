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
} from "./product.schema";

const router = Router();

router
  .route("/products")
  .post(validateRequest(productCreateSchema, "body"), createProduct);
router
  .route("/products")
  .get(validateRequest(productQuerySchema, "query"), getAllProducts);
router
  .route("/products/:id")
  .patch(validateRequest(productParamsSchema, "params"), updateProduct)
  .get(validateRequest(productParamsSchema, "params"), getOneProduct)
  .delete(validateRequest(productParamsSchema, "params"), deleteProduct);

export default router;
