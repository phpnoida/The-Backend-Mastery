import { type Request, type Response, type NextFunction } from "express";

// Generic over Express's 4 Request slots so a controller's typed request
// (TypedRequestBody / Params / Query) flows through without a "not assignable" error.
const catchAsync =
  <P = any, ResBody = any, ReqBody = any, ReqQuery = any>(
    fn: (
      req: Request<P, ResBody, ReqBody, ReqQuery>,
      res: Response,
      next: NextFunction
    ) => Promise<any>
  ) =>
  (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response,
    next: NextFunction
  ) => {
    fn(req, res, next).catch((err) => next(err));
  };

export default catchAsync;
