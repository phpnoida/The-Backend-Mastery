import express from "express";
import cors from "cors";
import userRoute from "@modules/users/user.route";

const app = express();

app.use(express.json());
app.use(cors());
app.options("*splat", cors());

app.use("/api/v1", userRoute);

export default app;
