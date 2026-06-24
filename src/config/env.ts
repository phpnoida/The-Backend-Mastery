import dotenv from "dotenv";

// NODE_ENV is set by the npm script (or deployment platform), never from a .env file.
// This loads .env.development, .env.staging, or .env.production accordingly.
const nodeEnv = process.env["NODE_ENV"] ?? "development";
dotenv.config({ path: `.env.${nodeEnv}` });

const ENV = {
  NODE_ENV: nodeEnv,
  PORT: process.env["PORT"] ?? 6001,
  MONGO_URI: process.env["MONGO_URI"] || "mongodb://127.0.0.1:27017/zod",

  // Comma-separated whitelist of origins allowed to call this API from a browser.
  // e.g. CORS_ORIGINS="https://app.example.com,https://admin.example.com"
  // Parsed into a clean array here so app.ts can do a simple `.includes(origin)`.
  CORS_ORIGINS: (process.env["CORS_ORIGINS"] ?? "http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
} as const;

export default ENV;
