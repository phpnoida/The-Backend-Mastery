import type {
  TypedRequest,
  TypedRequestBody,
  TypedRequestParams,
  TypedRequestQuery,
} from "@/types/express";
import catchAsync from "@/utils/catchAsync";
import type {
  ProductCreateDto,
  ProductParamDto,
  ProductQueryDto,
  ProductUpdateDto,
} from "./product.schema";
import type { Response } from "express";
import { productService } from "./product.service";
import AppError from "@/utils/AppError";

export const createProduct = catchAsync(
  async (req: TypedRequestBody<ProductCreateDto>, res: Response) => {
    console.log("createProduct controller..");
    const data = await productService.create(req.body);
    res.status(201).json({
      status: "success",
      msg: "Product Created",
      data: data,
    });
  }
);

export const updateProduct = catchAsync(
  async (req: TypedRequest<ProductParamDto, ProductUpdateDto, never>, res) => {
    console.log("updateProduct controller...");
    const data = await productService.update(req.params.id, req.body);
    if (!data) {
      throw new AppError("Invalid ProductId", 404);
    }
    res.status(200).json({
      status: "success",
      msg: "Product Updated",
      data: data,
    });
  }
);

export const deleteProduct = catchAsync(
  async (req: TypedRequestParams<ProductParamDto>, res: Response) => {
    console.log("deleteProduct controller...");
  }
);

export const getAllProducts = catchAsync(
  async (req: TypedRequestQuery<ProductQueryDto>, res: Response) => {
    console.log("getAllProducts controller...");
  }
);

export const getOneProduct = catchAsync(
  async (req: TypedRequestParams<ProductParamDto>, res: Response) => {
    console.log("getOneProduct controller...");
  }
);
