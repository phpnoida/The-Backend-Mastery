import { createServer } from "http";
import app from "./app";
import ENV from "@/config/env";

const server = createServer(app);
const PORT = ENV.PORT;

// --- SAFETY NET 1: Uncaught Exceptions ---
// Occurs in SYNCHRONOUS code (e.g., a console.log(undefinedVariable))
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1); // Exit immediately because the app state is now polluted
});

const startServer = () => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running in ${ENV.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();

// --- SAFETY NET 2: Unhandled Rejections ---
process.on("unhandledRejection", (err: any) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down gracefully...");
  console.error(err.name, err.message);

  // Give the server time to finish existing requests before closing
  server.close(() => {
    process.exit(1);
  });
});
