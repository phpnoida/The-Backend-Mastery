import dotenv from "dotenv";

// NODE_ENV is set by the npm script (or deployment platform), never from a .env file.
// This loads .env.development, .env.staging, or .env.production accordingly.
const nodeEnv = process.env["NODE_ENV"] ?? "development";
dotenv.config({ path: `.env.${nodeEnv}` });

const ENV = {
  NODE_ENV: nodeEnv,
  PORT: process.env["PORT"] ?? 6001,
  MONGO_URI: process.env["MONGO_URI"] ?? "mongodb://localhost:27017/backend-mastery",
} as const;

export default ENV;
