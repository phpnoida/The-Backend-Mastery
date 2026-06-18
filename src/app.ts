import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import userRoute from "@/modules/users/user.route";
import AppError from "@/utils/AppError";
import globalErrorHandler from "@/middlewares/globalErrorHandler";
import ENV from "@/config/env";

const app = express();

// --- Global middleware ---
app.use(helmet()); // secure HTTP headers
app.use(cors());
app.options("*splat", cors()); // Express 5: wildcards must be named
app.use(express.json()); // parse JSON request bodies
app.use(morgan(ENV.NODE_ENV === "development" ? "dev" : "combined")); // request logging

// --- Routes (mounted under /api/v1) ---
app.use("/api/v1", userRoute);

// --- 404 for any unmatched route ---
app.use((_req, _res, next) => {
  next(new AppError("Invalid url", 404));
});

// --- Centralized error handler — MUST be last ---
app.use(globalErrorHandler);

export default app;
