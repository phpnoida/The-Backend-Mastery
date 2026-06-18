import { type Request, type Response, type NextFunction } from "express";
import AppError from "../utils/AppError";
import ENV from "../config/env";

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
  const error =
    err instanceof AppError
      ? err
      : new AppError(err.message || "Internal Server Error", 500);
  if (ENV.NODE_ENV === "development") {
    sendDevError(error, res);
    return;
  } else {
    sendProdError(error, res);
    return;
  }
};

export default globalErrorHandler;
