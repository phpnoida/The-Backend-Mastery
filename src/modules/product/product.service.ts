import { Product, type ProductDoc } from "./product.model";
import type {
  ProductCreateDto,
  ProductQueryDto,
  ProductUpdateDto,
} from "./product.schema";
import type { Paginated } from "../../types/api";

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
  delete(id: string): Promise<ProductDoc | null> {
    return Product.findByIdAndDelete(id);
  },
  findById(id: string): Promise<ProductDoc | null> {
    return Product.findById(id).select("-__v").sort("-createdAt");
  },
  async findAll(q: ProductQueryDto): Promise<Paginated<ProductDoc>> {
    const filter: Record<string, unknown> = {};

    //pagination
    const page = q.page;
    const limit = q.limit;
    const skip = (page - 1) * limit;
    const data = await Product.find(filter)
      .sort({
        [q.sortBy]: q.sort === "asc" ? 1 : -1,
      })
      .skip(skip)
      .limit(limit);
    const totalRec = await Product.countDocuments(filter);

    return {
      totalRec: totalRec,
      data: data,
      page,
      limit,
      totalPage: Math.ceil(totalRec / limit),
    };
  },
};
