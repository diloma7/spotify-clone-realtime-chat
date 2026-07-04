import express from "express";
import path from "path";
import cors from "cors";
import fileUpload from "express-fileupload";
import cron from "node-cron";
import fs from "fs";
import { clerkMiddleware } from "@clerk/express";
import { env } from "../config/env.js";
import { registerRoutes } from "../api/routes/index.js";
import { globalRateLimitMiddleware } from "../api/middleware/rate-limit.middleware.js";

const __dirname = path.resolve();
const uploadTempDir = path.join(__dirname, "temp");

const corsOrigin = (origin, callback) => {
  if (!origin || env.clientUrls.includes(origin)) {
    return callback(null, true);
  }

  return callback(new Error(`Origin ${origin} is not allowed by CORS`));
};

export const createApp = () => {
  const app = express();

  // behind nginx or any reverse proxy, trust the first proxy hop
  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
    })
  );

  app.use(express.json());

  // Clerk middleware must run before rate limiting so that getAuth(req) is available
  // and we can optionally bypass rate limiting for authenticated users.
  app.use(clerkMiddleware());

  app.use(globalRateLimitMiddleware);

  app.use(
    fileUpload({
      useTempFiles: true,
      tempFileDir: uploadTempDir,
      createParentPath: true,
      limits: { fileSize: 50 * 1024 * 1024 },
      abortOnLimit: true,
    })
  );

  // Lightweight health check endpoint for load balancers / uptime checks
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  cron.schedule("0 * * * *", () => {
    if (fs.existsSync(uploadTempDir)) {
      fs.readdir(uploadTempDir, (err, files) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.log("error", err);
          return;
        }
        for (const file of files) {
          fs.unlink(path.join(uploadTempDir, file), () => {});
        }
      });
    }
  });

  registerRoutes(app);

  if (env.nodeEnv === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    app.get("*", (req, res) => {
      res.sendFile(
        path.resolve(__dirname, "../frontend", "dist", "index.html")
      );
    });
  }

  app.use((error, req, res, next) => {
    // eslint-disable-next-line no-console
    console.error(error);
    res.status(500).json({
      message:
        env.nodeEnv === "production" ? "Internal Server Error" : error.message,
    });
  });

  return app;
};
