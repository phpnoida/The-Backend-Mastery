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
import type { ApiResponse, Paginated } from "@/types/api";
import type { ProductDoc } from "./product.model";

export const createProduct = catchAsync(
  async (
    req: TypedRequestBody<ProductCreateDto>,
    res: Response<ApiResponse<ProductDoc>>
  ) => {
    const data = await productService.create(req.body);
    res.status(201).json({
      status: "success",
      msg: "Product Created",
      data: data,
    });
  }
);

export const updateProduct = catchAsync(
  async (
    req: TypedRequest<ProductParamDto, ProductUpdateDto, never>,
    res: Response<ApiResponse<ProductDoc>>
  ) => {
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
  async (
    req: TypedRequestParams<ProductParamDto>,
    res: Response<ApiResponse<ProductDoc>>
  ) => {
    const id = req.params.id;
    const data = await productService.delete(id);
    if (!data) {
      throw new AppError("Invalid ProductId", 404);
    }
    res.status(204).send();
    // res.status(200).json({
    //   status: "success",
    //   msg: "Delete",
    // });
  }
);

export const getAllProducts = catchAsync(
  async (
    req: TypedRequestQuery<ProductQueryDto>,
    res: Response<ApiResponse<Paginated<ProductDoc>>>
  ) => {
    console.log("getAllProducts controller...");
    const data = await productService.findAll(req.query);
    res.status(200).json({
      status: "success",
      msg: "ok",
      data: data,
    });
  }
);

export const getOneProduct = catchAsync(
  async (
    req: TypedRequestParams<ProductParamDto>,
    res: Response<ApiResponse<ProductDoc>>
  ) => {
    const { id } = req.params;
    const data = await productService.findById(id);
    if (!data) {
      throw new AppError("Invalid ProductId", 404);
    }
    res.status(200).json({
      status: "success",
      msg: "ok",
      data: data,
    });
  }
);
