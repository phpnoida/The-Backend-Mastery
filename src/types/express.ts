import { type Request } from "express";

export type TypedRequestBody<T> = Request<{}, {}, T>;
export type TypedRequestParams<T> = Request<T>;
export type TypedRequestQuery<T> = Request<{}, {}, {}, T>;
export type TypedRequest<TParams, TBody, TQuery> = Request<
  TParams,
  {},
  TBody,
  TQuery
>;
