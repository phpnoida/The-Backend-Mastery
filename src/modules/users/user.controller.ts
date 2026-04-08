import catchAsync from "@utils/catchAsync";
import type { Request, Response } from "express";

export const addUser = catchAsync(async (req: Request, res: Response) => {
  console.log("reaching inside addUser...");
});
