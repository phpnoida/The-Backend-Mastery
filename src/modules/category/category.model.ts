import {
  model,
  Schema,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";
import slugify from "slugify";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export type CategoryType = InferSchemaType<typeof categorySchema>;

export type CategoryDoc = HydratedDocument<CategoryType>;
categorySchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

const Category = model("Category", categorySchema);

export default Category;
