// src/server.ts
import { createServer } from "http";

// src/app.ts
import express from "express";
import cors from "cors";

// src/modules/users/user.route.ts
import { Router } from "express";

// src/utils/catchAsync.ts
import "express";
var catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};
var catchAsync_default = catchAsync;

// src/modules/users/user.controller.ts
var addUser = catchAsync_default(async (req, res) => {
  console.log("reaching inside addUser...");
});

// src/modules/users/user.route.ts
var router = Router();
router.route("/user/add").post(addUser);
var user_route_default = router;

// src/app.ts
var app = express();
app.use(express.json());
app.use(cors());
app.options("*splat", cors());
app.use("/api/v1", user_route_default);
var app_default = app;

// src/config/env.ts
import "dotenv/config";
var ENV = {
  NODE_ENV: process.env["NODE_ENV"] || "development",
  PORT: process.env["PORT"] || 6001
};
var env_default = ENV;

// src/server.ts
var server = createServer(app_default);
var PORT = env_default.PORT;
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! \u{1F4A5} Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});
var startServer = () => {
  server.listen(PORT, () => {
    console.log(`\u{1F680} Server running in ${env_default.NODE_ENV} mode on port ${PORT}`);
  });
};
startServer();
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! \u{1F4A5} Shutting down gracefully...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
