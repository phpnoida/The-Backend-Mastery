import type {
  TypedRequestBody,
  TypedRequestParams,
  TypedRequestQuery,
  TypedRequest,
} from "@/types/express";
import catchAsync from "@/utils/catchAsync";
import { type Response } from "express";
import type {
  ProductCreateDto,
  ProductParamDto,
  ProductQueryDto,
  ProductUpdateDto,
} from "./product.schema";

export const createProduct = catchAsync(
  async (req: TypedRequestBody<ProductCreateDto>, res: Response) => {
    console.log("add product..");
  }
);

export const updateProduct = catchAsync(
  async (
    req: TypedRequest<ProductParamDto, ProductUpdateDto, {}>,
    res: Response
  ) => {
    console.log("update product..");
  }
);

export const deleteProduct = catchAsync(
  async (req: TypedRequestParams<ProductParamDto>, res: Response) => {
    console.log("delete product..");
  }
);

export const getAllProducts = catchAsync(
  async (req: TypedRequestQuery<ProductQueryDto>, res: Response) => {
    console.log("getAll products..");
  }
);

export const getOneProduct = catchAsync(
  async (req: TypedRequestParams<ProductParamDto>, res: Response) => {
    console.log("get particular product...");
  }
);
