// src/types/api.ts
export type ApiResponse<T> = {
  status: "success";
  msg: string;
  data?: T;
};

export type ApiError = {
  status: "fail" | "error";
  msg: string;
};

export type Paginated<T> = {
  data: T[];
  totalRec: number;
  page: number;
  limit: number;
  totalPage: number;
};
