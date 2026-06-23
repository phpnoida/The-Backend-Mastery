import { type Request, type Response, type NextFunction } from "express";
import mongoose from "mongoose";
import AppError from "../utils/AppError";
import ENV from "../config/env";

// Convert Mongoose/MongoDB errors into operational AppErrors so
// sendProdError exposes a meaningful message instead of "Something went wrong".
const normalizeError = (err: Error): AppError => {
  // Schema validation failed (required field missing, enum mismatch, etc.)
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    return new AppError(messages, 400);
  }

  // Invalid ObjectId or wrong field type (e.g. "abc" passed as _id)
  if (err instanceof mongoose.Error.CastError) {
    return new AppError(`Invalid ${err.path}: ${String(err.value)}`, 400);
  }

  // Duplicate unique index violation
  if ((err as NodeJS.ErrnoException & { code?: number }).code === 11000) {
    const field = Object.keys((err as any).keyValue ?? {})[0] ?? "field";
    return new AppError(`${field} already exists`, 409);
  }

  if (err instanceof AppError) return err;

  // Unknown / unexpected error → non-operational so prod hides the raw message.
  return new AppError(err.message || "Internal Server Error", 500, false);
};

const sendDevError = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendProdError = (err: AppError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const error = normalizeError(err);

  if (ENV.NODE_ENV === "development") {
    sendDevError(error, res);
    return;
  }
  sendProdError(error, res);
};

export default globalErrorHandler;
