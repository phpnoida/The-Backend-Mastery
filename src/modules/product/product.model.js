import { model, Schema, } from "mongoose";
import slugify from "slugify";
const productSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    slug: {
        type: String,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    brand: {
        type: Schema.Types.ObjectId,
        ref: "Brand",
        required: true,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    seller: {
        type: Schema.Types.ObjectId,
        ref: "Seller",
        required: true,
    },
    // A product has multiple variants (iPhone 15: 128GB Black, 256GB Blue, 512GB White).
    variants: [
        {
            type: Schema.Types.ObjectId,
            ref: "ProductVariant",
        },
    ],
    // Useful for "Sort by Price" and "Starting at..." displays
    startingPrice: {
        type: Number,
    },
    status: {
        type: String,
        enum: {
            values: ["draft", "active", "inactive", "banned"],
        },
        default: "draft",
    },
    tags: [{ type: String }],
    seo: {
        metaTitle: {
            type: String,
        },
        metaDescription: {
            type: String,
        },
    },
    avgRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
    },
    reviewCount: {
        type: Number,
        default: 0,
    },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
productSchema.index({
    name: "text",
    description: "text",
    tags: "text",
});
productSchema.pre("save", function (next) {
    this.slug = slugify(this.name, { lower: true, strict: true });
    next();
});
const Product = model("Product", productSchema);
export default Product;
