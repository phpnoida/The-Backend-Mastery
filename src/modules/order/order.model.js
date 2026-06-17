import { model, Schema, } from "mongoose";
const statusHistorySchema = new Schema({
    status: {
        type: String,
        enum: [
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "out_for_delivery",
            "delivered",
            "cancelled",
            "return_requested",
            "returned",
        ],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { _id: false });
const shippingAddressSchema = new Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
}, { _id: false });
const itemSchema = new Schema({
    variantId: {
        type: Schema.Types.ObjectId,
        ref: "ProductVariant",
        required: true,
    },
    productName: {
        type: String,
        required: true,
    },
    variant: {
        type: Schema.Types.Mixed,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    mrp: {
        type: Number,
        required: true,
    },
    sellingPrice: {
        type: Number,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
}, { _id: false });
const orderSchema = new Schema({
    customerId: {
        type: Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    customerEmail: {
        type: String,
        required: true,
    },
    items: {
        type: [itemSchema],
        required: true,
    },
    totalMrp: {
        type: Number,
        required: true,
    },
    totalDiscount: {
        type: Number,
        default: 0,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    shippingAddress: {
        type: shippingAddressSchema,
        required: true,
    },
    status: {
        type: String,
        enum: [
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "out_for_delivery",
            "delivered",
            "cancelled",
            "return_requested",
            "returned",
        ],
        default: "pending",
    },
    statusHistory: [
        {
            type: statusHistorySchema,
        },
    ],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
const Order = model("Order", orderSchema);
export default Order;
