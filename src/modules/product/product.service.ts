import { Product, type ProductDoc } from "./product.model";
import type {
  ProductCreateDto,
  ProductQueryDto,
  ProductUpdateDto,
} from "./product.schema";

export const productService = {
  create(data: ProductCreateDto): Promise<ProductDoc> {
    console.log("data from service", data);
    const product = Product.create(data);
    return product;
  },
  findAll(data: ProductQueryDto): Promise<ProductDoc[]> {
    let query = { ...data };
    console.log("query is", query);
    const products = Product.find();
    return products;
  },
  findById(id: string): Promise<ProductDoc | null> {
    const product = Product.findById(id);
    return product;
  },
  update(id: string, data: ProductUpdateDto): Promise<ProductDoc | null> {
    const product = Product.findByIdAndUpdate(id, data, { new: true });
    return product;
  },
  delete(id: string): Promise<ProductDoc | null> {
    const product = Product.findByIdAndDelete(id);
    return product;
  },
};
