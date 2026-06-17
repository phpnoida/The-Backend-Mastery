import { model, Schema, } from "mongoose";
const warehouseAddressSchema = new Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
});
const warehouseSchema = new Schema({
    warehouseCode: { type: String, required: true, unique: true }, // "WH-DEL-001"
    name: { type: String, required: true },
    address: { type: warehouseAddressSchema, required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
const Warehouse = model("Warehouse", warehouseSchema);
export default Warehouse;
