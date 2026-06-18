import catchAsync from "@/utils/catchAsync";
import type { Request, Response } from "express";

// Plain Request/Response. Once you add Zod validation, bind the DTO with `as`:
//   const body = req.body as CreateUserDto;
export const addUser = catchAsync(async (req: Request, res: Response) => {
  const newUser = req.body;
  res.status(201).json({ status: "success", data: newUser });
});
