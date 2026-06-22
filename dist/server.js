// src/server.ts
import { createServer } from "http";

// src/app.ts
import express from "express";
import cors from "cors";

// src/modules/product/product.route.ts
import { Router } from "express";

// src/utils/catchAsync.ts
import "express";
var catchAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch((err) => next(err));
};
var catchAsync_default = catchAsync;

// src/modules/product/product.model.ts
import {
  model,
  Schema
} from "mongoose";
var productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    sku: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 1,
      max: 1e6
    },
    category: {
      type: String,
      required: true,
      enum: {
        values: ["electronics", "books", "clothing", "food", "toys"],
        message: "values can be either electronics or books or clothing or food or toys"
      }
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    inStock: {
      type: Boolean,
      default: true
    },
    tags: [
      {
        type: String,
        default: []
      }
    ],
    description: {
      type: String,
      default: ""
    }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
productSchema.index({
  title: 1
});
productSchema.index(
  {
    sku: 1
  },
  { unique: true }
);
var Product = model("Product", productSchema);

// src/modules/product/product.service.ts
var productService = {
  create(data) {
    console.log("data from service", data);
    const product = Product.create(data);
    return product;
  },
  findAll(data) {
    let query = { ...data };
    console.log("query is", query);
    const products = Product.find();
    return products;
  },
  findById(id) {
    const product = Product.findById(id);
    return product;
  },
  update(id, data) {
    const product = Product.findByIdAndUpdate(id, data, { new: true });
    return product;
  },
  delete(id) {
    const product = Product.findByIdAndDelete(id);
    return product;
  }
};

// src/utils/AppError.ts
var AppError = class extends Error {
  statusCode;
  status;
  isOperational;
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
};
var AppError_default = AppError;

// src/modules/product/product.controller.ts
var createProduct = catchAsync_default(async (req, res) => {
  console.log("create product controller..");
  const body = req.body;
  const product = await productService.create(body);
  res.status(201).json({
    status: "success",
    meta: {
      message: "Product Created"
    },
    data: product
  });
});
var updateProduct = catchAsync_default(async (req, res) => {
  console.log("update product controller...");
  const body = req.body;
  const { id } = req.params;
  const product = await productService.update(id, body);
  if (!product) {
    throw new AppError_default("Invalid productId", 404);
  }
  res.status(200).json({
    status: "success",
    meta: {
      message: "Product Updated"
    },
    data: product
  });
});
var deleteProduct = catchAsync_default(async (req, res) => {
  console.log("delete product controller..");
  const productId = req.params;
  const product = await productService.delete(productId.id);
  if (product === null) {
    throw new AppError_default("Invalid productId", 404);
  }
  res.status(200).json({
    status: "success",
    meta: {
      message: "Product Deleted"
    }
  });
});
var getAllProducts = catchAsync_default(
  async (req, res) => {
    console.log("get all products controller..");
    const query = req.query;
    const products = await productService.findAll(query);
    res.status(200).json({
      status: "success",
      data: products
    });
  }
);
var getOneProduct = catchAsync_default(async (req, res) => {
  console.log("get one product controller..");
  const productId = req.params;
  const product = await productService.findById(productId.id);
  if (!product) {
    throw new AppError_default("Invalid productId", 404);
  }
  res.status(200).json({
    status: "success",
    data: product
  });
});

// src/middlewares/validateRequest.ts
import "zod";
import "express";
var validateRequest = (schema, source = "body") => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const message = result.error.issues.map((issue) => `${issue.path.join(".") || source}: ${issue.message}`).join("; ");
    return next(new AppError_default(message, 400));
  }
  Object.defineProperty(req, source, {
    value: result.data,
    writable: true,
    configurable: true
  });
  next();
};
var validateRequest_default = validateRequest;

// src/modules/product/product.schema.ts
import { z } from "zod";
var productCreateSchema = z.object({
  title: z.string("Title is required").trim().min(2, "Title must be at least 2 characters").max(100, "Title cannot exceed 100 characters"),
  sku: z.string("SKU is required").regex(
    /^[A-Z0-9]+(-[A-Z0-9]+)*$/,
    "SKU must be uppercase letters/digits in hyphen-separated groups (e.g. KB-100)"
  ),
  price: z.number("Price is required").gt(0, "Price must be greater than 0").max(1e6, "Price cannot exceed 1,000,000"),
  category: z.enum(["electronics", "books", "clothing", "food", "toys"], {
    error: "values can be either electronics or books or clothing or food or toys"
  }),
  quantity: z.number("Quantity is required").int("Quantity must be a whole number").min(0, "Quantity cannot be less than 0"),
  inStock: z.boolean().default(true),
  tags: z.array(
    z.string().min(1, "Tag cannot be empty").max(20, "Each tag cannot exceed 20 characters")
  ).max(10, "At most 10 tags allowed").default([]),
  description: z.string().max(500, "Description cannot exceed 500 characters").default("")
});
var productUpdateSchema = productCreateSchema.partial();
var productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.enum(["asc", "desc"]).default("desc"),
  sortBy: z.enum(["title", "price", "createdAt"]).default("createdAt"),
  // New Optional Filters
  category: z.enum(["electronics", "books", "clothing", "food", "toys"]).optional(),
  search: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0, "Minimum price cannot be negative").optional(),
  maxPrice: z.coerce.number().min(0, "Maximum price cannot be negative").optional()
});
var productParamsSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "invalid id")
  // ④ stricter than .length(24)
});

// src/modules/product/product.route.ts
var router = Router();
router.route("/products").post(validateRequest_default(productCreateSchema, "body"), createProduct);
router.route("/products").get(validateRequest_default(productQuerySchema, "query"), getAllProducts);
router.route("/products/:id").patch(validateRequest_default(productParamsSchema, "params"), updateProduct).get(validateRequest_default(productParamsSchema, "params"), getOneProduct).delete(validateRequest_default(productParamsSchema, "params"), deleteProduct);
var product_route_default = router;

// src/middlewares/globalErrorHandler.ts
import "express";

// src/config/env.ts
import dotenv from "dotenv";
var nodeEnv = process.env["NODE_ENV"] ?? "development";
dotenv.config({ path: `.env.${nodeEnv}` });
var ENV = {
  NODE_ENV: nodeEnv,
  PORT: process.env["PORT"] ?? 6001,
  MONGO_URI: process.env["MONGO_URI"] || "mongodb://127.0.0.1:27017/zod"
};
var env_default = ENV;

// src/middlewares/globalErrorHandler.ts
var sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err
  });
};
var sendProdError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    console.error("ERROR \u{1F4A5}", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong!"
    });
  }
};
var globalErrorHandler = (err, _req, res, _next) => {
  const error = err instanceof AppError_default ? err : new AppError_default(err.message || "Internal Server Error", 500);
  if (env_default.NODE_ENV === "development") {
    sendDevError(error, res);
    return;
  } else {
    sendProdError(error, res);
    return;
  }
};
var globalErrorHandler_default = globalErrorHandler;

// src/app.ts
var app = express();
app.use(express.json());
app.use(cors());
app.options("*splat", cors());
app.use("/api/v1", product_route_default);
app.use((_req, _res, next) => {
  next(new AppError_default("Invalid url", 404));
});
app.use(globalErrorHandler_default);
var app_default = app;

// src/config/mongoose.ts
import mongoose from "mongoose";
var connectDB = async () => {
  mongoose.connection.on("disconnected", () => {
    console.log("Mongoose lost connection to the database!");
  });
  try {
    await mongoose.connect(`${env_default.MONGO_URI}`, {
      // These are the important production options
      maxPoolSize: 10,
      // max simultaneous connections in pool
      serverSelectionTimeoutMS: 5e3,
      socketTimeoutMS: 45e3
    });
    console.log(`mongodb connected`);
  } catch (err) {
    console.log("DB Err-->", err);
    throw err;
  }
};

// src/server.ts
var server = createServer(app_default);
var PORT = env_default.PORT;
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! \u{1F4A5} Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});
var startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`\u{1F680} Server running in ${env_default.NODE_ENV} mode on port ${PORT}`);
  });
};
startServer();
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! \u{1F4A5} Shutting down gracefully...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
