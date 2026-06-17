import {
  model,
  Schema,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const productVariantSchema = new Schema(
  {
    name: { type: String, required: true }, // "128GB / Midnight Black"
    skuCode: { type: String, required: true, unique: true },
    attributes: { type: Schema.Types.Mixed }, // { size: "XL", color: "Red" }
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },

    mrp: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export type ProductVariantType = InferSchemaType<typeof productVariantSchema>;

export type ProductVariantDoc = HydratedDocument<ProductVariantType>;

const ProductVariant = model("ProductVariant", productVariantSchema);

export default ProductVariant;
