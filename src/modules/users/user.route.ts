import { Router } from "express";
import { addUser } from "./user.controller";

const router = Router();
router.post("/users", addUser);

export default router;
