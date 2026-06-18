import type {
  TypedRequestBody,
  TypedRequestParams,
  TypedRequest,
} from "@/types/express";
import catchAsync from "@/utils/catchAsync";
import { type Request, type Response } from "express";
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
  async (req: Request, res: Response) => {
    // Express 5 types req.query as ParsedQs (strings). validateRequest has already
    // coerced + defaulted it, so cast to the typed DTO — the runtime shape is guaranteed.
    const query = req.query as unknown as ProductQueryDto;
    console.log("getAll products..", query);
  }
);

export const getOneProduct = catchAsync(
  async (req: TypedRequestParams<ProductParamDto>, res: Response) => {
    console.log("get particular product...");
  }
);
