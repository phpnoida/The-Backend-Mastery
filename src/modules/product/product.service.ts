import { Product, type ProductDoc } from "./product.model";
import type {
  ProductCreateDto,
  ProductParamDto,
  ProductUpdateDto,
} from "./product.schema";

export const productService = {
  create(data: ProductCreateDto): Promise<ProductDoc> {
    return Product.create(data);
  },
  update(id: string, data: ProductUpdateDto): Promise<ProductDoc | null> {
    return Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  },
};
