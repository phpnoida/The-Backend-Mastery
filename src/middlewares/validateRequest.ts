// src/middlewares/validateRequest.ts
import { type ZodType } from "zod";
import { type RequestHandler } from "express";
import AppError from "@/utils/AppError";

type RequestSource = "body" | "query" | "params";

// Return RequestHandler<any, any, any, any> so this middleware does NOT pin the
// Request generics. When chained with a typed controller in the same `.get(...)`
// call, TS then infers ReqQuery/ReqBody from the controller (e.g. ProductQueryDto)
// instead of Express's default `ParsedQs`, which would not be assignable.
const validateRequest =
  (schema: ZodType, source: RequestSource = "body"): RequestHandler<any, any, any, any> =>
  (req, _res, next) => {
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
