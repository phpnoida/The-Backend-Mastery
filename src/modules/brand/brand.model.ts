import {
  model,
  Schema,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";
import slugify from "slugify";

const brandSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    logoUrl: {
      type: String,
      required: true,
    },
    countryOfOrigin: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export type BrandType = InferSchemaType<typeof brandSchema>;

export type BrandDoc = HydratedDocument<BrandType>;

brandSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

const Brand = model("Brand", brandSchema);

export default Brand;
