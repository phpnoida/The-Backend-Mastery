import {
  model,
  Schema,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const addressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
});

const supplierSchema = new Schema(
  {
    companyName: {
      type: String,
      trim: true,
      required: true,
    },
    contactName: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
    },
    address: [
      {
        type: addressSchema,
        required: true,
      },
    ],
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "ProductVariant",
        required: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export type SupplierType = InferSchemaType<typeof supplierSchema>;

export type SupplierDoc = HydratedDocument<SupplierType>;

const Supplier = model("Supplier", supplierSchema);

export default Supplier;
