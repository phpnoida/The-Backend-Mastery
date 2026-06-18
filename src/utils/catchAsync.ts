import { type Request, type Response, type NextFunction } from "express";

// Wraps an async route handler so a rejected promise is forwarded to Express's
// error handler via next(err) — without this, a throwing async controller hangs the request.
const catchAsync =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch(next);

export default catchAsync;
