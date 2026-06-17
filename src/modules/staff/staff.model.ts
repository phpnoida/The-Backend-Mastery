import {
  model,
  Schema,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const staffSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    password: { type: String, required: true, select: false },

    role: {
      type: String,
      required: true,
      enum: [
        "super_admin",
        "admin",
        "warehouse_manager",
        "warehouse_staff",
        "customer_support",
        "delivery_agent",
      ],
    },

    department: {
      type: String,
      required: true,
      enum: [
        "operations",
        "customer_support",
        "logistics",
        "finance",
        "hr",
        "tech",
      ],
    },

    // Only for warehouse-tied roles; optional for others
    warehouse: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
    },

    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export type StaffType = InferSchemaType<typeof staffSchema>;

export type StaffDoc = HydratedDocument<StaffType>;
const Staff = model("Staff", staffSchema);

export default Staff;
