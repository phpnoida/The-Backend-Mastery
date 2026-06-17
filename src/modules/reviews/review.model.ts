import {
  model,
  Schema,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const reviewSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    variantId: {
      type: Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    // many times csutomer just rate so keeping title optional
    title: {
      type: String,
    },
    body: {
      type: String,
    },
    images: [String],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

reviewSchema.index(
  {
    customerId: 1,
    variantId: 1,
  },
  { unique: true }
);

export type ReviewType = InferSchemaType<typeof reviewSchema>;

export type ReviewDoc = HydratedDocument<ReviewType>;
const Review = model("Review", reviewSchema);

export default Review;
