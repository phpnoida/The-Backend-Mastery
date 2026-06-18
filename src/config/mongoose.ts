import mongoose from "mongoose";
import ENV from "./env";

export const connectDB = async () => {
  // 1. Set up the "watcher" BEFORE or during connection
  mongoose.connection.on("disconnected", () => {
    console.log("Mongoose lost connection to the database!");
  });

  try {
    await mongoose.connect(`${ENV.MONGO_URI}`, {
      // These are the important production options
      maxPoolSize: 10, // max simultaneous connections in pool
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`mongodb connected`);
  } catch (err) {
    console.log("DB Err-->", err);
    throw err; // ← let server.ts's startup fail loudly
  }
};

// Call this on graceful shutdown (SIGTERM / SIGINT in server.ts)
export const disconnectDB = async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed");
};
