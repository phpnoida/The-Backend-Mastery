import { Router } from "express";
import { addUser } from "./user.controller";
const router = Router();
router.route("/user/add").post(addUser);

export default router;
