// src/middlewares/validateRequest.ts
import { type ZodType } from "zod";
import { type Request, type Response, type NextFunction } from "express";
import AppError from "@/utils/AppError";

type RequestSource = "body" | "query" | "params";

const validateRequest =
  (schema: ZodType, source: RequestSource = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".") || source}: ${issue.message}`)
        .join("; ");
      return next(new AppError(message, 400));
    }

    // Express 5: req.query / req.params are GETTER-ONLY — `req.query = ...` throws.
    // defineProperty shadows the getter with the parsed (coerced + defaulted) value
    // so downstream controllers see the clean data, not the raw strings.
    Object.defineProperty(req, source, {
      value: result.data,
      writable: true,
      configurable: true,
    });

    next();
  };

export default validateRequest;
