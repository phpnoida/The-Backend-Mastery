import { type Request, type Response, type NextFunction } from "express";

// Generic so each controller's typed Request (body / params / query) is preserved.
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
