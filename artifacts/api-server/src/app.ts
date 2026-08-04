import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

// ── Require SESSION_SECRET in production ────────────────────────────────────
const SESSION_SECRET = process.env["SESSION_SECRET"];
if (!SESSION_SECRET) {
  if (process.env["NODE_ENV"] === "production") {
    throw new Error("SESSION_SECRET must be set in production");
  }
  logger.warn("SESSION_SECRET is not set — using an insecure dev fallback");
}

const app: Express = express();

// ── Proxy trust ────────────────────────────────────────────────────────────
// Trust the single hop added by Replit's edge proxy so that req.ip reflects
// the real client address from X-Forwarded-For (first entry only).
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// ── CORS ────────────────────────────────────────────────────────────────────
// Restrict to the known Replit preview domain and localhost (dev).
// Arbitrary origins cannot invoke the paid image-generation endpoint.
const replitDomain = process.env["REPLIT_DEV_DOMAIN"];
const explicitOrigin = process.env["CORS_ORIGIN"];

const allowedOrigins: (string | RegExp)[] = [
  /^https?:\/\/localhost(:\d+)?$/,
];
if (replitDomain) allowedOrigins.push(`https://${replitDomain}`);
if (explicitOrigin) allowedOrigins.push(explicitOrigin);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser(SESSION_SECRET ?? "dev-fallback-secret"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
