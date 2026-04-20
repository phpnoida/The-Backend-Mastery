// src/server.ts
import { createServer } from "http";

// src/app.ts
import express from "express";
import cors from "cors";
var app = express();
app.use(express.json());
app.use(cors());
app.options("*splat", cors());
var app_default = app;

// src/config/env.ts
import dotenv from "dotenv";
var nodeEnv = process.env["NODE_ENV"] ?? "development";
dotenv.config({ path: `.env.${nodeEnv}` });
var ENV = {
  NODE_ENV: nodeEnv,
  PORT: process.env["PORT"] ?? 6001,
  MONGO_URI: process.env["MONGO_URI"] ?? "mongodb://localhost:27017/backend-mastery"
};
var env_default = ENV;

// src/config/mongoose.ts
import mongoose from "mongoose";
var connectDB = async () => {
  mongoose.connection.on("disconnected", () => {
    console.log("Mongoose lost connection to the database!");
  });
  try {
    await mongoose.connect(env_default.MONGO_URI, {
      // These are the important production options
      maxPoolSize: 10,
      // max simultaneous connections in pool
      serverSelectionTimeoutMS: 5e3,
      socketTimeoutMS: 45e3
    });
    console.log(`mongodb connected on ${env_default.NODE_ENV} mode`);
  } catch (err) {
    console.log("DB Err-->", err);
  }
};
var disconnectDB = async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed");
};

// src/server.ts
var server = createServer(app_default);
var PORT = env_default.PORT;
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! \u{1F4A5} Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});
var startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`\u{1F680} Server running in ${env_default.NODE_ENV} mode on port ${PORT}`);
  });
};
startServer();
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! \u{1F4A5} Shutting down gracefully...");
  console.error(err.name, err.message);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});
["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  });
});
