import express from "express";
import cors from "cors";
import productRoute from "./modules/product/product.route";
import AppError from "./utils/AppError";
import globalErrorHandler from "./middlewares/globalErrorHandler";

const app = express();

app.use(express.json());
app.use(cors());
app.options("*splat", cors());

app.use("/api/v1", productRoute);

// Catch-all for unmatched routes → 404 (path-less app.use, no wildcard needed in Express 5)
app.use((_req, _res, next) => {
  next(new AppError("Invalid url", 404));
});

app.use(globalErrorHandler);

export default app;
