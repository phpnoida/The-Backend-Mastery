import {
  model,
  Schema,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [1, "Price must be at least 1"],
      max: [1000000, "Price cannot exceed 1,000,000"],
    },
    category: {
      type: String,
      required: true,
      enum: {
        values: ["electronics", "books", "clothing", "food", "toys"],
        message:
          "values can be either electronics or books or clothing or food or toys",
      },
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    tags: [
      {
        type: String,
        default: [],
      },
    ],
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// indexing
productSchema.index({
  title: 1,
});
productSchema.index(
  {
    sku: 1,
  },
  { unique: true }
);

export type ProductType = InferSchemaType<typeof productSchema>;
export type ProductDoc = HydratedDocument<ProductType>;

const Product = model("Product", productSchema);

export { Product };
