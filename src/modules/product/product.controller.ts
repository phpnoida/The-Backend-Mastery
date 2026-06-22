import catchAsync from "@/utils/catchAsync";
import type { Request, Response } from "express";
import type {
  ProductCreateDto,
  ProductParamDto,
  ProductQueryDto,
  ProductUpdateDto,
} from "./product.schema";
import { productService } from "./product.service";
import AppError from "@/utils/AppError";

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  console.log("create product controller..");
  const body = req.body as ProductCreateDto;
  const product = await productService.create(body);

  res.status(201).json({
    status: "success",
    meta: {
      message: "Product Created",
    },
    data: product,
  });
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  console.log("update product controller...");
  const body = req.body as ProductUpdateDto;
  const { id } = req.params as ProductParamDto;
  const product = await productService.update(id, body);
  if (!product) {
    throw new AppError("Invalid productId", 404);
  }
  res.status(200).json({
    status: "success",
    meta: {
      message: "Product Updated",
    },
    data: product,
  });
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  console.log("delete product controller..");
  const productId = req.params as ProductParamDto;
  const product = await productService.delete(productId.id);
  if (product === null) {
    throw new AppError("Invalid productId", 404);
  }
  res.status(200).json({
    status: "success",
    meta: {
      message: "Product Deleted",
    },
  });
});

export const getAllProducts = catchAsync(
  async (req: Request, res: Response) => {
    console.log("get all products controller..");
    const query = req.query as unknown as ProductQueryDto;
    const products = await productService.findAll(query);
    res.status(200).json({
      status: "success",
      data: products,
    });
  }
);

export const getOneProduct = catchAsync(async (req: Request, res: Response) => {
  console.log("get one product controller..");
  const productId = req.params as ProductParamDto;
  const product = await productService.findById(productId.id);
  if (!product) {
    throw new AppError("Invalid productId", 404);
  }

  res.status(200).json({
    status: "success",
    data: product,
  });
});
