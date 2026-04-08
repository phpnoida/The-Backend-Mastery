import "dotenv/config";
const ENV = {
  NODE_ENV: process.env["NODE_ENV"] || "development",
  PORT: process.env["PORT"] || 6001,
} as const;

export default ENV;
