import { type Request } from "express";

export type TypedRequestBody<T> = Request<{}, {}, T>; // typed req.body
export type TypedRequestParams<T> = Request<T>; // typed req.params
export type TypedRequestQuery<T> = Request<{}, {}, {}, T>; // typed req.query
export type TypedRequest<P, B, Q> = Request<P, {}, B, Q>; // typed params + body + query
