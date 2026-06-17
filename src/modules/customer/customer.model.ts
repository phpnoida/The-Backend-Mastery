import {
  model,
  Schema,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const addressSchema = new Schema({
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: "Default",
    enum: {
      values: ["Default", "Home", "Office", "Other"],
    },
  },
  isDefault: {
    type: Boolean,
  },
});

const customerSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      required: true,
    },
    // phone not marked compulsory becuase many ecomm needs either email or phone compulosry
    phone: {
      type: String,
    },
    // password not marked compulosry becuase otp can also be used to login
    password: {
      type: String,
      select: false,
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    tier: {
      type: String,
      default: "silver",
      enum: {
        values: ["silver", "gold", "platinum"],
      },
    },
    lastLogin: {
      type: Date,
    },
    deletedAt: {
      type: Date,
      default: null, //means not deleted
    },
    address: [addressSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

customerSchema.index({ email: 1 }, { unique: true });
customerSchema.index({ phone: 1 }, { unique: true, sparse: true });

export type CustomerType = InferSchemaType<typeof customerSchema>;

export type CustomerDoc = HydratedDocument<CustomerType>;

const Customer = model("Customer", customerSchema);

export default Customer;
