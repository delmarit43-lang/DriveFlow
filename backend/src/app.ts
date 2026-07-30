import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { corsOrigins, env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import v1 from "./routes/index.js";

const moduleDir = dirname(fileURLToPath(import.meta.url));
const frontendDistCandidates = [
  resolve(process.cwd(), "frontend/dist"),
  resolve(moduleDir, "../../frontend/dist"),
  resolve(moduleDir, "../frontend/dist"),
];
const frontendDist =
  frontendDistCandidates.find((dir) => existsSync(join(dir, "index.html"))) ??
  frontendDistCandidates[0];

export function createApp() {
  const app = express();

  if (env.TRUST_PROXY) {
    app.set("trust proxy", 1);
  }

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use(compression());
  app.use(cors({ origin: corsOrigins, credentials: true }));
  app.use(express.json({ limit: "6mb" }));

  app.use(
    "/api/",
    rateLimit({
      windowMs: 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: "Too many requests" },
    }),
  );

  app.use("/api/v1", v1);

  if (process.env.NODE_ENV === "production" || process.argv.includes("--prod")) {
    if (existsSync(join(frontendDist, "index.html"))) {
      app.use(express.static(frontendDist, { index: false, maxAge: "1y", immutable: true }));
      app.get("*", (_req, res) => res.sendFile(join(frontendDist, "index.html")));
    }
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
