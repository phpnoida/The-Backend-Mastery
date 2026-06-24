import { createServer } from "http";
import app from "./app";
import ENV from "@/config/env";
import { connectDB, disconnectDB } from "./config/mongoose";

const server = createServer(app);
const PORT = ENV.PORT;

// --- SAFETY NET 1: Uncaught Exceptions ---
// Occurs in SYNCHRONOUS code (e.g., a console.log(undefinedVariable))
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1); // Exit immediately because the app state is now polluted
});

const startServer = async () => {
  await connectDB();
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

// --- GRACEFUL SHUTDOWN: SIGTERM / SIGINT ---
// These are EXPECTED shutdowns (a deploy or a Ctrl+C), not crashes — so we exit 0,
// and we tear down in the right order: stop taking new work → drain → close the DB pool.
const gracefulShutdown = async (signal: string) => {
  // Log which signal triggered the shutdown — useful in container/orchestrator logs
  console.log(`\n${signal} received — shutting down gracefully...`);

  // 1. Stop accepting NEW connections. The callback fires only AFTER all
  //    in-flight requests have finished — this is the "drain" that prevents
  //    cutting a client off mid-response during a deploy.
  server.close(async () => {
    // 2. HTTP is fully drained — now it's safe to close the Mongo connection pool.
    //    Doing this BEFORE the drain could kill a query a request still needs.
    await disconnectDB();
    console.log("Process terminated cleanly ✅");

    // 3. Exit 0 = "I meant to stop." (A crash would exit 1.) Orchestrators read
    //    this code to tell a clean shutdown from a failure.
    process.exit(0);
  });

  // 4. Safety valve: if draining hangs (a stuck keep-alive socket, a slow query),
  //    don't wait forever — force-exit after 10s so the orchestrator isn't blocked.
  //    .unref() lets the process still exit early if shutdown finishes first.
  setTimeout(() => {
    console.error("Forced shutdown — drain timed out 💥");
    process.exit(1);
  }, 10_000).unref();
};

// SIGTERM: sent by Docker / Kubernetes / PM2 on deploy, scale-down, or `docker stop`.
// SIGINT:  sent by Ctrl+C in the terminal during local development.
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
