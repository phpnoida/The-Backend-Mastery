import mongoose from "mongoose";
import ENV from "./env.js";

export const connectDB = async () => {
  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected");
  });

  mongoose.connection.on("disconnected", () => {
    // Fires when the TCP connection drops (internet gone, Atlas blip, etc.)
    // Mongoose will auto-reconnect — this log tells you WHY things look broken
    console.warn("MongoDB disconnected — Mongoose will auto-reconnect");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("MongoDB reconnected");
  });

  mongoose.connection.on("error", (err) => {
    // Fires for ongoing connection errors after initial connect
    console.error("MongoDB connection error:", err.message);
  });

  await mongoose.connect(ENV.MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
};

// Call this on graceful shutdown (SIGTERM / SIGINT in server.ts)
export const disconnectDB = async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed");
};
