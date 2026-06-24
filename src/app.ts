import express from "express";
import cors, { type CorsOptions } from "cors";
import helmet from "helmet";
import productRoute from "./modules/product/product.route";
import AppError from "./utils/AppError";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import ENV from "./config/env";

const app = express();

/* ──────────────────────────────────────────────────────────────────────────
 * 1. helmet — secure HTTP response headers
 * Set FIRST so EVERY response (even errors) carries the headers. Out of the box
 * it sets ~15 headers: hides `X-Powered-By: Express` (don't advertise your stack),
 * adds HSTS, X-Content-Type-Options: nosniff, frame protection, etc.
 * ────────────────────────────────────────────────────────────────────────── */
app.use(helmet());

/* ──────────────────────────────────────────────────────────────────────────
 * 2. CORS — Cross-Origin Resource Sharing
 *
 * WHAT IT IS: a BROWSER security rule. When JS on `https://a.com` calls an API on
 * `https://b.com`, the browser blocks the page from READING the response unless
 * the API replies with an `Access-Control-Allow-Origin` header naming `a.com`.
 *
 * ⭐ FAMOUS Q1 — "Does CORS protect my server?" → NO. CORS is enforced by the
 *    *browser*, not the server. It controls which web pages can read your response
 *    via fetch/XHR. A non-browser client (curl, Postman, another backend) ignores
 *    CORS completely. So CORS is NOT auth/authorization — it's not a security
 *    boundary for your data, only a same-origin policy relaxation for browsers.
 *
 * ⭐ FAMOUS Q2 — "Why does Postman work but my React app gets a CORS error?"
 *    → Postman/curl are not browsers: they don't enforce CORS AND they send no
 *      `Origin` header. Below, `!origin` (no Origin) is allowed — that's how
 *      Postman, curl, mobile apps, server-to-server calls and health checks pass.
 *      A browser on a non-whitelisted origin DOES send Origin → it gets rejected.
 *
 * ⭐ FAMOUS Q3 — "What is a preflight request?"
 *    → For "non-simple" requests (methods like PATCH/DELETE/PUT, or a JSON
 *      Content-Type, or custom headers like Authorization) the browser first
 *      sends an automatic `OPTIONS` request asking "am I allowed?". The cors()
 *      middleware answers it with the Allow-* headers. Our `app.options(...)`
 *      line below makes sure every route can answer that preflight.
 *
 * ⭐ FAMOUS Q4 — "Why can't I use `origin: '*'` with credentials?"
 *    → The spec forbids `Access-Control-Allow-Origin: *` together with
 *      `Allow-Credentials: true`. With cookies/Authorization you MUST echo back a
 *      specific origin — which is exactly why we whitelist instead of using `*`.
 * ────────────────────────────────────────────────────────────────────────── */
const corsOptions: CorsOptions = {
  // `origin` is the value of the browser's Origin header (undefined for non-browser
  // tools). cb(err, allow): allow=true → send the Allow-Origin header for THIS origin.
  origin(origin, cb) {
    // !origin  → Postman / curl / server-to-server / same-origin → allow.
    // whitelisted browser origin → allow. anything else → reject with 403.
    if (!origin || ENV.CORS_ORIGINS.includes(origin)) {
      return cb(null, true);
    }
    return cb(new AppError(`CORS: origin '${origin}' is not allowed`, 403));
  },
  credentials: true, // allow cookies / Authorization header on cross-origin requests
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
// Answer the OPTIONS preflight for every route with the SAME options.
// Express 5 note: bare "*" is invalid — use a named wildcard "*splat".
app.options("*splat", cors(corsOptions));

/* ──────────────────────────────────────────────────────────────────────────
 * 3. Body parsing — with a SIZE CAP.
 * `limit: "10kb"` rejects oversized JSON bodies (a cheap DoS: posting a 50MB
 * payload to exhaust memory/CPU). Pick a limit that fits your largest real body.
 * ────────────────────────────────────────────────────────────────────────── */
app.use(express.json({ limit: "10kb" }));

app.use("/api/v1", productRoute);

// Catch-all for unmatched routes → 404 (path-less app.use, no wildcard needed in Express 5)
app.use((_req, _res, next) => {
  next(new AppError("Invalid url", 404));
});

app.use(globalErrorHandler);

export default app;
