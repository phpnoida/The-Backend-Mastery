import {
  model,
  Schema,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const inventoryItemSchema = new Schema(
  {
    productVariantId: {
      type: Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    quantityAvailable: {
      type: Number,
      required: true,
      min: 0,
    },
    quantityReserved: {
      type: Number,
      default: 0,
      min: 0,
    },
    quantityDamaged: {
      type: Number,
      default: 0,
      min: 0,
    },
    reorderLevel: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

inventoryItemSchema.index(
  {
    productVariantId: 1,
    warehouseId: 1,
  },
  { unique: true }
);

export type InventoryItemType = InferSchemaType<typeof inventoryItemSchema>;

export type InventoryItemDoc = HydratedDocument<InventoryItemType>;

const InventoryItem = model("InventoryItem", inventoryItemSchema);

export default InventoryItem;
