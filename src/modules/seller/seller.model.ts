import {
  model,
  Schema,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";
const bankInfoSchema = new Schema({
  accountNumber: {
    type: String,
    required: true,
  },
  ifsc: {
    type: String,
    required: true,
  },
  accountHolderName: {
    type: String,
    required: true,
  },
});
const sellerSchema = new Schema(
  {
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    //indexin becuase seller can be searched based on emailId by staff
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      select: false,
      required: true,
    },
    //   indexing because staff can search seller based on gstId
    gstin: {
      type: String,
      required: true,
      unique: true,
    },
    bankInfo: {
      type: bankInfoSchema,
      select: false,
    },
    status: {
      type: String,
      default: "pending_verification",
      enum: ["pending_verification", "active", "suspended"],
    },
    avgRating: {
      type: Number,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

sellerSchema.index({
  phone: 1,
});

export type SellerType = InferSchemaType<typeof sellerSchema>;

export type SellerDoc = HydratedDocument<SellerType>;
const Seller = model("Seller", sellerSchema);

export default Seller;
