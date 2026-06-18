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

// src/modules/product/product.controller.ts
import "express";
var createProduct = catchAsync_default(
  async (req, res) => {
    console.log("add product..");
  }
);
var updateProduct = catchAsync_default(
  async (req, res) => {
    console.log("update product..");
  }
);
var deleteProduct = catchAsync_default(
  async (req, res) => {
    console.log("delete product..");
  }
);
var getAllProducts = catchAsync_default(
  async (req, res) => {
    console.log("getAll products..");
  }
);
var getOneProduct = catchAsync_default(
  async (req, res) => {
    console.log("get particular product...");
  }
);

// src/modules/product/product.route.ts
var router = Router();
router.route("/products").post(createProduct);
router.route("/products/:id").patch(updateProduct);
router.route("/products").get(getAllProducts);
router.route("/products/:id").get(getOneProduct);
var product_route_default = router;

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
