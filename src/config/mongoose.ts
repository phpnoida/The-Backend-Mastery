import mongoose from "mongoose";
import ENV from "./env";

export const connectDB = async () => {
  // Watch for drops AFTER the initial connect (network blips, DB restarts).
  mongoose.connection.on("disconnected", () => {
    console.log("Mongoose lost connection to the database!");
  });

  try {
    await mongoose.connect(ENV.MONGO_URI, {
      maxPoolSize: 10, // max simultaneous connections in the pool
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ DB connection failed:", err);
    // Re-throw so the caller (server.ts) aborts startup — never boot a DB-less server.
    throw err;
  }
};

// Call on graceful shutdown (SIGTERM / SIGINT in server.ts).
export const disconnectDB = async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed");
};
